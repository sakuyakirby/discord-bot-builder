class ExportPanel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showQuickDeploy: true,
            showInstructions: true,
            ...options
        };
        
        this.currentCode = '';
        this.currentLanguage = 'javascript';
        this.botName = 'MyDiscordBot';
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupEventListeners();
    }
    
    createUI() {
        this.container.innerHTML = `
            <div class="export-panel">
                <div class="export-header">
                    <h3><i class="fas fa-rocket"></i> エクスポート</h3>
                    <div class="bot-name-input">
                        <input type="text" id="export-bot-name" value="${this.botName}" 
                               placeholder="Bot名">
                    </div>
                </div>
                
                <div class="export-options">
                    <div class="option-group">
                        <h4><i class="fas fa-file-code"></i> コードをエクスポート</h4>
                        <div class="option-buttons">
                            <button class="export-btn" data-format="js">
                                <i class="fab fa-js-square"></i> JavaScript
                            </button>
                            <button class="export-btn" data-format="ts">
                                <i class="fas fa-file-code"></i> TypeScript
                            </button>
                            <button class="export-btn" data-format="py">
                                <i class="fab fa-python"></i> Python
                            </button>
                        </div>
                    </div>
                    
                    <div class="option-group">
                        <h4><i class="fas fa-file-archive"></i> 完全パッケージ</h4>
                        <div class="option-buttons">
                            <button class="export-btn primary" data-format="full-js">
                                <i class="fab fa-js-square"></i> JavaScriptパッケージ
                            </button>
                            <button class="export-btn primary" data-format="full-ts">
                                <i class="fas fa-file-code"></i> TypeScriptパッケージ
                            </button>
                            <button class="export-btn primary" data-format="full-py">
                                <i class="fab fa-python"></i> Pythonパッケージ
                            </button>
                        </div>
                    </div>
                    
                    <div class="option-group">
                        <h4><i class="fas fa-copy"></i> その他</h4>
                        <div class="option-buttons">
                            <button class="export-btn secondary" id="btn-copy-clipboard">
                                <i class="fas fa-copy"></i> クリップボードにコピー
                            </button>
                            <button class="export-btn secondary" id="btn-generate-readme">
                                <i class="fas fa-book"></i> README生成
                            </button>
                            <button class="export-btn secondary" id="btn-export-workspace">
                                <i class="fas fa-save"></i> ワークスペース保存
                            </button>
                        </div>
                    </div>
                </div>
                
                ${this.options.showQuickDeploy ? this.createQuickDeploySection() : ''}
                ${this.options.showInstructions ? this.createInstructionsSection() : ''}
            </div>
        `;
    }
    
    createQuickDeploySection() {
        return `
            <div class="quick-deploy">
                <h4><i class="fas fa-bolt"></i> ワンクリックデプロイ</h4>
                <div class="deploy-options">
                    <a href="#" class="deploy-btn deploy-replit" target="_blank">
                        <i class="fas fa-cloud"></i> Replitで開く
                    </a>
                    <a href="#" class="deploy-btn deploy-glitch" target="_blank">
                        <i class="fas fa-magic"></i> Glitchで開く
                    </a>
                    <button class="deploy-btn deploy-railway" id="btn-railway-guide">
                        <i class="fas fa-train"></i> Railwayガイド
                    </button>
                </div>
            </div>
        `;
    }
    
    createInstructionsSection() {
        return `
            <div class="instructions">
                <h4><i class="fas fa-graduation-cap"></i> 使い方ガイド</h4>
                <div class="instruction-steps">
                    <div class="step">
                        <span class="step-number">1</span>
                        <div class="step-content">
                            <strong>コードをダウンロード</strong>
                            <p>上記のボタンからコードをダウンロード</p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">2</span>
                        <div class="step-content">
                            <strong>依存関係をインストール</strong>
                            <p>必要なパッケージをインストール</p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">3</span>
                        <div class="step-content">
                            <strong>トークンを設定</strong>
                            <p>Discord Developer Portalでトークンを取得</p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">4</span>
                        <div class="step-content">
                            <strong>Botを実行</strong>
                            <p>コマンドを実行してBotを起動</p>
                        </div>
                    </div>
                </div>
                
                <div class="quick-links">
                    <a href="#guide-discord" class="quick-link">
                        <i class="fab fa-discord"></i> Discord Bot作成ガイド
                    </a>
                    <a href="#guide-hosting" class="quick-link">
                        <i class="fas fa-server"></i> ホスティング方法
                    </a>
                    <a href="#guide-troubleshooting" class="quick-link">
                        <i class="fas fa-question-circle"></i> トラブルシューティング
                    </a>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // ボット名更新
        document.getElementById('export-bot-name').addEventListener('input', (e) => {
            this.botName = e.target.value || 'MyDiscordBot';
        });
        
        // エクスポートボタン
        document.querySelectorAll('.export-btn[data-format]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.closest('button').dataset.format;
                this.handleExport(format);
            });
        });
        
        // クリップボードにコピー
        document.getElementById('btn-copy-clipboard').addEventListener('click', () => {
            this.copyToClipboard();
        });
        
        // README生成
        document.getElementById('btn-generate-readme').addEventListener('click', () => {
            this.generateReadme();
        });
        
        // ワークスペース保存
        document.getElementById('btn-export-workspace').addEventListener('click', () => {
            this.exportWorkspace();
        });
        
        // Railwayガイド
        document.getElementById('btn-railway-guide')?.addEventListener('click', () => {
            this.showRailwayGuide();
        });
        
        // デプロイボタンのリンク設定
        this.setupDeployLinks();
    }
    
    setupDeployLinks() {
        // Replitリンク
        const replitBtn = document.querySelector('.deploy-replit');
        if (replitBtn) {
            replitBtn.href = this.generateReplitUrl();
        }
        
        // Glitchリンク
        const glitchBtn = document.querySelector('.deploy-glitch');
        if (glitchBtn) {
            glitchBtn.href = this.generateGlitchUrl();
        }
    }
    
    setCode(code, language) {
        this.currentCode = code;
        this.currentLanguage = language;
    }
    
    handleExport(format) {
        if (!this.currentCode) {
            this.showMessage('エクスポートするコードがありません', 'error');
            return;
        }
        
        switch(format) {
            case 'js':
                this.exportAsFile('javascript');
                break;
            case 'ts':
                this.exportAsFile('typescript');
                break;
            case 'py':
                this.exportAsFile('python');
                break;
            case 'full-js':
                this.exportFullPackage('javascript');
                break;
            case 'full-ts':
                this.exportFullPackage('typescript');
                break;
            case 'full-py':
                this.exportFullPackage('python');
                break;
        }
    }
    
    exportAsFile(language) {
        const extension = {
            'javascript': 'js',
            'typescript': 'ts',
            'python': 'py'
        }[language] || 'txt';
        
        let code = this.currentCode;
        
        // 言語が異なる場合は変換が必要（ここでは簡易実装）
        if (language !== this.currentLanguage) {
            code = this.convertCode(language);
        }
        
        const filename = `${this.botName.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
        ExportUtils.exportAsFile(filename, code);
        
        this.showMessage(`${filename}をダウンロードしました`, 'success');
    }
    
    exportFullPackage(language) {
        let code = this.currentCode;
        
        // 言語が異なる場合は変換
        if (language !== this.currentLanguage) {
            code = this.convertCode(language);
        }
        
        const files = ExportUtils.generateCompletePackage(code, language, this.botName);
        
        // 簡易実装：最初のファイルだけダウンロード
        // 実際にはJSZipなどでZIPファイルを作成
        const mainFile = files.find(f => 
            f.filename.includes('.js') || 
            f.filename.includes('.ts') || 
            f.filename.includes('.py')
        );
        
        if (mainFile) {
            ExportUtils.exportAsFile(mainFile.filename, mainFile.content);
            this.showMessage(`パッケージをダウンロードしました`, 'success');
        }
    }
    
    convertCode(targetLanguage) {
        // 簡易的なコード変換
        // 実際には各Generatorクラスを使用
        switch(targetLanguage) {
            case 'javascript':
                return this.currentCode; // 仮の実装
            case 'typescript':
                return this.currentCode.replace(/require\('/g, "import ");
            case 'python':
                return this.currentCode.replace(/const /g, '').replace(/let /g, '');
            default:
                return this.currentCode;
        }
    }
    
    async copyToClipboard() {
        if (!this.currentCode) {
            this.showMessage('コピーするコードがありません', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(this.currentCode);
            this.showMessage('コードをクリップボードにコピーしました', 'success');
        } catch (err) {
            console.error('コピーに失敗しました:', err);
            this.showMessage('コピーに失敗しました', 'error');
        }
    }
    
    generateReadme() {
        const readme = CodeFormatter.generateReadme(
            this.currentCode, 
            this.currentLanguage, 
            this.botName
        );
        
        const filename = 'README.md';
        ExportUtils.exportAsFile(filename, readme);
        
        this.showMessage(`${filename}を生成しました`, 'success');
    }
    
    exportWorkspace() {
        // ワークスペースデータをエクスポート
        const event = new CustomEvent('exportWorkspaceRequest');
        document.dispatchEvent(event);
        
        this.showMessage('ワークスペースのエクスポートをリクエストしました', 'info');
    }
    
    showRailwayGuide() {
        const guide = `
# RailwayでDiscord Botをデプロイする方法

## ステップ1: Railwayアカウント作成
1. https://railway.app にアクセス
2. GitHubでログイン

## ステップ2: 新しいプロジェクト作成
1. "New Project"をクリック
2. "Deploy from GitHub repo"を選択
3. リポジトリを選択または新規作成

## ステップ3: 環境変数の設定
1. プロジェクトの "Variables"タブを開く
2. 以下の環境変数を追加:
   - \`DISCORD_TOKEN\`: あなたのBotトークン
   - \`NODE_VERSION\`: 18 (Node.jsのバージョン)

## ステップ4: デプロイ
1. GitHubにコードをプッシュ
2. Railwayが自動的にデプロイ
3. ログを確認してエラーがないか確認

## よくある問題
- **トークンエラー**: トークンが正しいか確認
- **ポートエラー**: Railwayは自動的にポートを割り当てます
- **メモリ不足**: 無料プランではメモリ制限があります

## 参考リンク
- [Railwayドキュメント](https://docs.railway.app)
- [Discord Bot作成ガイド](#guide-discord)
        `;
        
        const modal = this.createModal('Railwayデプロイガイド', guide);
        document.body.appendChild(modal);
    }
    
    generateReplitUrl() {
        // ReplitのテンプレートURLを生成
        const language = this.currentLanguage === 'python' ? 'python' : 'nodejs';
        const template = 'discord-bot';
        
        return `https://replit.com/new/${language}?template=${template}`;
    }
    
    generateGlitchUrl() {
        // Glitchの新規プロジェクトURL
        return 'https://glitch.com/edit/#!/new-discord-bot';
    }
    
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <pre>${content}</pre>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" id="modal-close-btn">閉じる</button>
                </div>
            </div>
        `;
        
        // 閉じるボタンのイベント
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#modal-close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // モーダル外をクリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        return modal;
    }
    
    showMessage(message, type = 'info') {
        const msgElement = document.createElement('div');
        msgElement.className = `export-message export-message-${type}`;
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
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(msgElement);
        
        setTimeout(() => {
            msgElement.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (msgElement.parentNode) {
                    msgElement.parentNode.removeChild(msgElement);
                }
            }, 300);
        }, 3000);
    }
    
    updateUI() {
        this.createUI();
        this.setupEventListeners();
    }
}
