class CodeViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            language: 'javascript',
            theme: 'github-dark',
            readOnly: false,
            lineNumbers: true,
            ...options
        };
        
        this.currentCode = '';
        this.currentLanguage = this.options.language;
        this.highlightInitialized = false;
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupEventListeners();
        this.initializeHighlightJS();
    }
    
    createUI() {
        this.container.innerHTML = `
            <div class="code-viewer-header">
                <div class="viewer-title">
                    <i class="fas fa-code"></i>
                    <h4>生成されたコード</h4>
                </div>
                <div class="viewer-actions">
                    <button class="btn-icon" id="btn-copy-code" title="コードをコピー">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon" id="btn-format-code" title="コードを整形">
                        <i class="fas fa-indent"></i>
                    </button>
                    <button class="btn-icon" id="btn-download-code" title="コードをダウンロード">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" id="btn-expand-code" title="全画面表示">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            </div>
            <div class="code-container">
                <pre><code id="code-display" class="language-${this.options.language}"></code></pre>
            </div>
            <div class="code-status-bar">
                <span id="code-language">${this.getLanguageName(this.options.language)}</span>
                <span id="code-length">0文字</span>
                <span id="code-lines">0行</span>
            </div>
        `;
        
        this.codeElement = document.getElementById('code-display');
    }
    
    setupEventListeners() {
        // コピーボタン
        document.getElementById('btn-copy-code').addEventListener('click', () => {
            this.copyToClipboard();
        });
        
        // 整形ボタン
        document.getElementById('btn-format-code').addEventListener('click', () => {
            this.formatCode();
        });
        
        // ダウンロードボタン
        document.getElementById('btn-download-code').addEventListener('click', () => {
            this.downloadCode();
        });
        
        // 全画面ボタン
        document.getElementById('btn-expand-code').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // コード選択時のイベント
        this.codeElement.addEventListener('mouseup', () => {
            this.updateSelectionInfo();
        });
    }
    
    initializeHighlightJS() {
        if (window.hljs && !this.highlightInitialized) {
            // 追加の言語定義があればここで登録
            this.highlightInitialized = true;
        }
    }
    
    setCode(code, language = null) {
        if (language) {
            this.currentLanguage = language;
        }
        
        this.currentCode = code;
        this.codeElement.textContent = code;
        this.codeElement.className = `language-${this.currentLanguage}`;
        
        // ハイライトを適用
        if (window.hljs) {
            hljs.highlightElement(this.codeElement);
        }
        
        // ステータスバーを更新
        this.updateStatusBar();
    }
    
    updateStatusBar() {
        const languageElement = document.getElementById('code-language');
        const lengthElement = document.getElementById('code-length');
        const linesElement = document.getElementById('code-lines');
        
        if (languageElement) {
            languageElement.textContent = this.getLanguageName(this.currentLanguage);
        }
        
        if (lengthElement) {
            lengthElement.textContent = `${this.currentCode.length}文字`;
        }
        
        if (linesElement) {
            const lines = this.currentCode.split('\n').length;
            linesElement.textContent = `${lines}行`;
        }
    }
    
    updateSelectionInfo() {
        const selection = window.getSelection();
        if (selection.toString().trim()) {
            // 選択中のテキスト情報を表示（省略）
        }
    }
    
    getLanguageName(langCode) {
        const languages = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'python': 'Python',
            'html': 'HTML',
            'css': 'CSS',
            'json': 'JSON'
        };
        
        return languages[langCode] || langCode;
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.currentCode);
            this.showToast('コードをクリップボードにコピーしました', 'success');
        } catch (err) {
            console.error('コピーに失敗しました:', err);
            this.showToast('コピーに失敗しました', 'error');
        }
    }
    
    formatCode() {
        const formatted = CodeFormatter.format(this.currentCode, this.currentLanguage);
        this.setCode(formatted);
        this.showToast('コードを整形しました', 'success');
    }
    
    downloadCode() {
        const extension = {
            'javascript': 'js',
            'typescript': 'ts',
            'python': 'py'
        }[this.currentLanguage] || 'txt';
        
        const filename = `discord-bot-${Date.now()}.${extension}`;
        ExportUtils.exportAsFile(filename, this.currentCode);
        this.showToast(`コードをダウンロードしました: ${filename}`, 'success');
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(err => {
                console.error('全画面表示に失敗しました:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    setLanguage(language) {
        this.currentLanguage = language;
        this.codeElement.className = `language-${language}`;
        this.updateStatusBar();
    }
    
    validateCode() {
        return CodeFormatter.validateCode(this.currentCode, this.currentLanguage);
    }
    
    addComments() {
        const commented = CodeFormatter.addComments(this.currentCode, this.currentLanguage);
        this.setCode(commented);
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#57F287' : type === 'error' ? '#ED4245' : '#5865F2'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    getCode() {
        return this.currentCode;
    }
    
    clear() {
        this.setCode('');
    }
    
    resize() {
        // 必要に応じてリサイズ処理を実装
    }
    
    destroy() {
        // クリーンアップ処理
        this.container.innerHTML = '';
    }
}

// トースト用のスタイルを追加
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(10px);
        }
    }
    
    .btn-icon {
        background: none;
        border: none;
        color: #b9bbbe;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .btn-icon:hover {
        background-color: #4f545c;
        color: white;
    }
    
    .code-viewer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: #2f3136;
        border-bottom: 1px solid #4f545c;
    }
    
    .viewer-title {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .viewer-title h4 {
        margin: 0;
        color: #b9bbbe;
    }
    
    .viewer-actions {
        display: flex;
        gap: 4px;
    }
    
    .code-container {
        flex: 1;
        overflow: auto;
    }
    
    .code-status-bar {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        background-color: #2f3136;
        border-top: 1px solid #4f545c;
        font-size: 12px;
        color: #99aab5;
    }
    
    pre {
        margin: 0;
        padding: 16px;
        height: 100%;
        overflow: auto;
    }
    
    code {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
    }
`;
document.head.appendChild(toastStyle);
