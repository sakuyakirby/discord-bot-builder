class BlockEditor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.workspace = null;
        this.options = {
            toolboxId: 'toolbox',
            readOnly: false,
            zoom: true,
            grid: true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createWorkspace();
        this.setupEventListeners();
        this.loadDefaultBlocks();
    }
    
    createWorkspace() {
        // カスタムツールボックスを作成
        const toolbox = BlocklyUtils.createDefaultToolbox();
        document.body.insertAdjacentHTML('beforeend', toolbox);
        
        // ワークスペースを作成
        this.workspace = BlocklyUtils.setupWorkspace('blocklyDiv', this.options.toolboxId);
        
        // カスタムカテゴリのコールバックを登録
        this.setupToolboxCallbacks();
    }
    
    setupToolboxCallbacks() {
        const callbacks = {
            'load_welcome_bot': () => this.loadTemplate('welcome-bot'),
            'load_music_bot': () => this.loadTemplate('music-bot'),
            'load_moderation_bot': () => this.loadTemplate('moderation-bot'),
            'load_poll_bot': () => this.loadTemplate('poll-bot'),
            'load_level_bot': () => this.loadTemplate('level-bot')
        };
        
        BlocklyUtils.registerToolboxCallbacks(this.workspace, callbacks);
    }
    
    setupEventListeners() {
        // ワークスペース変更イベント
        this.workspace.addChangeListener((event) => {
            if (event.type === Blockly.Events.BLOCK_CREATE ||
                event.type === Blockly.Events.BLOCK_DELETE ||
                event.type === Blockly.Events.BLOCK_CHANGE ||
                event.type === Blockly.Events.BLOCK_MOVE) {
                
                this.onWorkspaceChanged();
            }
        });
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveWorkspace();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.loadWorkspace();
                        break;
                    case 'z':
                        if (e.shiftKey) {
                            this.workspace.undo(false);
                        } else {
                            this.workspace.undo();
                        }
                        break;
                    case 'y':
                        this.workspace.undo(false);
                        break;
                    case 'd':
                        if (this.workspace.getSelected()) {
                            this.workspace.getSelected().dispose();
                        }
                        break;
                }
            }
        });
    }
    
    onWorkspaceChanged() {
        // カスタムイベントを発火
        const event = new CustomEvent('blocklyChange', {
            detail: { workspace: this.workspace }
        });
        document.dispatchEvent(event);
    }
    
    loadDefaultBlocks() {
        BlocklyUtils.addDefaultBlocks(this.workspace);
    }
    
    loadTemplate(templateId) {
        const templateLoader = new TemplateLoader();
        const template = templateLoader.loadTemplate(templateId);
        
        if (template) {
            if (confirm(`${template.name}を読み込みますか？現在の作業内容は失われます。`)) {
                templateLoader.applyTemplateToWorkspace(this.workspace, template);
                this.onWorkspaceChanged();
                
                // 通知
                this.showNotification(`${template.name}を読み込みました`, 'success');
            }
        } else {
            this.showNotification('テンプレートが見つかりませんでした', 'error');
        }
    }
    
    saveWorkspace() {
        const data = BlocklyUtils.saveWorkspace(this.workspace);
        const filename = `discord-bot-workspace-${Date.now()}.json`;
        
        ExportUtils.exportAsFile(filename, data);
        this.showNotification('ワークスペースを保存しました', 'success');
    }
    
    loadWorkspace() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = e.target.result;
                    if (BlocklyUtils.loadWorkspace(this.workspace, data)) {
                        this.showNotification('ワークスペースを読み込みました', 'success');
                        this.onWorkspaceChanged();
                    } else {
                        this.showNotification('ファイルの読み込みに失敗しました', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    clearWorkspace() {
        if (confirm('ワークスペースをクリアしますか？この操作は元に戻せません。')) {
            BlocklyUtils.clearWorkspace(this.workspace);
            this.onWorkspaceChanged();
            this.showNotification('ワークスペースをクリアしました', 'info');
        }
    }
    
    exportAsXml() {
        const xml = BlocklyUtils.exportAsXml(this.workspace);
        const filename = `discord-bot-blocks-${Date.now()}.xml`;
        
        ExportUtils.exportAsFile(filename, xml);
        this.showNotification('ブロックをXML形式でエクスポートしました', 'success');
    }
    
    importFromXml() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const xml = e.target.result;
                    if (BlocklyUtils.importFromXml(this.workspace, xml)) {
                        this.showNotification('XMLファイルを読み込みました', 'success');
                        this.onWorkspaceChanged();
                    } else {
                        this.showNotification('XMLファイルの読み込みに失敗しました', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    getWorkspace() {
        return this.workspace;
    }
    
    setReadOnly(readOnly) {
        this.workspace.options.readOnly = readOnly;
        this.workspace.updateToolbox(this.workspace.options.languageTree);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#57F287' : type === 'error' ? '#ED4245' : '#5865F2'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // ユーティリティメソッド
    addBlock(type, position = null) {
        const block = this.workspace.newBlock(type);
        
        if (position) {
            block.moveBy(position.x, position.y);
        } else {
            block.moveBy(100, 100);
        }
        
        return block;
    }
    
    getBlocksByType(type) {
        return this.workspace.getAllBlocks(false).filter(block => block.type === type);
    }
    
    getAllBlocks() {
        return this.workspace.getAllBlocks(false);
    }
    
    resize() {
        Blockly.svgResize(this.workspace);
    }
    
    dispose() {
        if (this.workspace) {
            this.workspace.dispose();
        }
    }
}

// 通知用のスタイルを追加
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
