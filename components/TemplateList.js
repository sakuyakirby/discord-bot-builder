class TemplateList {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showCategories: true,
            showSearch: true,
            ...options
        };
        
        this.templateLoader = new TemplateLoader();
        this.templates = this.templateLoader.getAllTemplates();
        this.filteredTemplates = [...this.templates];
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupEventListeners();
    }
    
    createUI() {
        this.container.innerHTML = `
            <div class="template-list">
                <div class="template-header">
                    <h3><i class="fas fa-th-large"></i> テンプレート</h3>
                    
                    ${this.options.showSearch ? `
                    <div class="template-search">
                        <input type="text" id="template-search" placeholder="テンプレートを検索...">
                        <i class="fas fa-search"></i>
                    </div>
                    ` : ''}
                </div>
                
                ${this.options.showCategories ? this.createCategoryFilter() : ''}
                
                <div class="template-grid" id="template-grid">
                    ${this.renderTemplates()}
                </div>
                
                <div class="template-actions">
                    <button class="btn-secondary" id="btn-import-template">
                        <i class="fas fa-upload"></i> テンプレートをインポート
                    </button>
                    <button class="btn-secondary" id="btn-export-template">
                        <i class="fas fa-download"></i> 現在の設定をテンプレートとして保存
                    </button>
                </div>
            </div>
        `;
    }
    
    createCategoryFilter() {
        const categories = this.getTemplateCategories();
        
        return `
            <div class="category-filter">
                <div class="category-tags">
                    <button class="category-tag active" data-category="all">すべて</button>
                    ${categories.map(cat => `
                        <button class="category-tag" data-category="${cat.id}">
                            ${cat.name} (${cat.count})
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    getTemplateCategories() {
        const categories = {
            'welcome': { name: 'ウェルカム', count: 0 },
            'moderation': { name: 'モデレーション', count: 0 },
            'music': { name: '音楽', count: 0 },
            'utility': { name: 'ユーティリティ', count: 0 },
            'fun': { name: '娯楽', count: 0 }
        };
        
        this.templates.forEach(template => {
            if (template.id.includes('welcome')) categories.welcome.count++;
            else if (template.id.includes('moderation')) categories.moderation.count++;
            else if (template.id.includes('music')) categories.music.count++;
            else if (template.id.includes('utility')) categories.utility.count++;
            else categories.fun.count++;
        });
        
        return Object.entries(categories).map(([id, data]) => ({
            id,
            name: data.name,
            count: data.count
        }));
    }
    
    renderTemplates() {
        if (this.filteredTemplates.length === 0) {
            return `
                <div class="no-templates">
                    <i class="fas fa-inbox"></i>
                    <p>テンプレートが見つかりませんでした</p>
                </div>
            `;
        }
        
        return this.filteredTemplates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-card-header">
                    <span class="template-language">${template.language.toUpperCase()}</span>
                    <div class="template-actions">
                        <button class="btn-icon btn-preview" title="プレビュー">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-use" title="使用する">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>
                
                <div class="template-card-body">
                    <h4>${template.name}</h4>
                    <p>${template.description}</p>
                    
                    <div class="template-features">
                        ${this.getTemplateFeatures(template).map(feature => `
                            <span class="feature-tag">${feature}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="template-card-footer">
                    <span class="template-info">
                        <i class="fas fa-cube"></i>
                        ${this.countBlocks(template)}ブロック
                    </span>
                    <button class="btn-load">
                        このテンプレートを使用
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    getTemplateFeatures(template) {
        const features = [];
        
        if (template.id.includes('welcome')) features.push('ウェルカム');
        if (template.id.includes('moderation')) features.push('モデレーション');
        if (template.id.includes('music')) features.push('音楽');
        if (template.id.includes('poll')) features.push('投票');
        if (template.id.includes('level')) features.push('レベル');
        if (template.id.includes('utility')) features.push('ユーティリティ');
        
        return features.slice(0, 3); // 最大3つまで表示
    }
    
    countBlocks(template) {
        if (template.blocks && Array.isArray(template.blocks)) {
            return template.blocks.length;
        }
        return 0;
    }
    
    setupEventListeners() {
        // 検索
        const searchInput = document.getElementById('template-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTemplates(e.target.value);
            });
        }
        
        // カテゴリフィルター
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });
        
        // テンプレートカードのイベント
        document.querySelectorAll('.template-card').forEach(card => {
            const templateId = card.dataset.templateId;
            
            // プレビューボタン
            card.querySelector('.btn-preview').addEventListener('click', () => {
                this.previewTemplate(templateId);
            });
            
            // 使用ボタン
            card.querySelector('.btn-use').addEventListener('click', () => {
                this.useTemplate(templateId);
            });
            
            // カード全体のクリック（詳細表示）
            card.querySelector('.btn-load').addEventListener('click', () => {
                this.useTemplate(templateId);
            });
        });
        
        // テンプレートインポート
        document.getElementById('btn-import-template').addEventListener('click', () => {
            this.importTemplate();
        });
        
        // テンプレートエクスポート
        document.getElementById('btn-export-template').addEventListener('click', () => {
            this.exportTemplate();
        });
    }
    
    filterTemplates(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredTemplates = [...this.templates];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredTemplates = this.templates.filter(template =>
                template.name.toLowerCase().includes(term) ||
                template.description.toLowerCase().includes(term)
            );
        }
        
        this.updateTemplateGrid();
    }
    
    filterByCategory(category) {
        // カテゴリタグのアクティブ状態を更新
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        document.querySelector(`.category-tag[data-category="${category}"]`).classList.add('active');
        
        if (category === 'all') {
            this.filteredTemplates = [...this.templates];
        } else {
            this.filteredTemplates = this.templates.filter(template =>
                template.id.includes(category)
            );
        }
        
        this.updateTemplateGrid();
    }
    
    updateTemplateGrid() {
        const grid = document.getElementById('template-grid');
        if (grid) {
            grid.innerHTML = this.renderTemplates();
            // イベントリスナーを再設定
            this.setupTemplateCardListeners();
        }
    }
    
    setupTemplateCardListeners() {
        document.querySelectorAll('.template-card').forEach(card => {
            const templateId = card.dataset.templateId;
            
            card.querySelector('.btn-preview').addEventListener('click', () => {
                this.previewTemplate(templateId);
            });
            
            card.querySelector('.btn-use').addEventListener('click', () => {
                this.useTemplate(templateId);
            });
            
            card.querySelector('.btn-load').addEventListener('click', () => {
                this.useTemplate(templateId);
            });
        });
    }
    
    previewTemplate(templateId) {
        const template = this.templateLoader.loadTemplate(templateId);
        if (!template) return;
        
        const modal = this.createTemplatePreviewModal(template);
        document.body.appendChild(modal);
    }
    
    useTemplate(templateId) {
        if (confirm('このテンプレートを読み込みますか？現在の作業内容は失われます。')) {
            // テンプレート読み込みイベントを発火
            const event = new CustomEvent('templateLoad', {
                detail: { templateId }
            });
            document.dispatchEvent(event);
            
            this.showMessage(`"${this.getTemplateName(templateId)}"を読み込みました`, 'success');
        }
    }
    
    importTemplate() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const templateId = this.templateLoader.importTemplateFromJson(e.target.result);
                        if (templateId) {
                            this.templates = this.templateLoader.getAllTemplates();
                            this.filteredTemplates = [...this.templates];
                            this.updateTemplateGrid();
                            
                            this.showMessage('テンプレートをインポートしました', 'success');
                        } else {
                            this.showMessage('テンプレートのインポートに失敗しました', 'error');
                        }
                    } catch (error) {
                        this.showMessage('無効なテンプレートファイルです', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    exportTemplate() {
        // 現在のワークスペースをテンプレートとして保存するリクエストを発火
        const event = new CustomEvent('exportTemplateRequest');
        document.dispatchEvent(event);
        
        this.showMessage('テンプレートのエクスポートをリクエストしました', 'info');
    }
    
    createTemplatePreviewModal(template) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>${template.name} - プレビュー</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="template-preview">
                        <div class="preview-info">
                            <p><strong>説明:</strong> ${template.description}</p>
                            <p><strong>言語:</strong> ${template.language}</p>
                            <p><strong>ブロック数:</strong> ${this.countBlocks(template)}</p>
                        </div>
                        
                        <div class="preview-code">
                            <h4>生成されるコード:</h4>
                            <pre><code class="language-${template.language}">${template.generatedCode?.[template.language] || 'コードはありません'}</code></pre>
                        </div>
                        
                        <div class="preview-features">
                            <h4>特徴:</h4>
                            <ul>
                                ${this.getTemplateFeatures(template).map(feature => `
                                    <li>${feature}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="modal-close-btn">閉じる</button>
                    <button class="btn-primary" id="modal-use-btn">このテンプレートを使用</button>
                </div>
            </div>
        `;
        
        // 閉じるボタン
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#modal-close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // 使用ボタン
        modal.querySelector('#modal-use-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.useTemplate(template.id);
        });
        
        // モーダル外クリック
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // コードハイライト
        setTimeout(() => {
            const codeElement = modal.querySelector('code');
            if (codeElement && window.hljs) {
                hljs.highlightElement(codeElement);
            }
        }, 100);
        
        return modal;
    }
    
    getTemplateName(templateId) {
        const template = this.templateLoader.loadTemplate(templateId);
        return template ? template.name : templateId;
    }
    
    showMessage(message, type = 'info') {
        const msgElement = document.createElement('div');
        msgElement.className = `template-message template-message-${type}`;
        msgElement.textContent = message;
        msgElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#57F287' : type === 'error' ? '#ED4245' : '#5865F2'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(msgElement);
        
        setTimeout(() => {
            if (msgElement.parentNode) {
                msgElement.parentNode.removeChild(msgElement);
            }
        }, 3000);
    }
    
    updateTemplates() {
        this.templates = this.templateLoader.getAllTemplates();
        this.filteredTemplates = [...this.templates];
        this.updateTemplateGrid();
    }
}
