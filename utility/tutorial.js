// チュートリアルシステム
class Tutorial {
    constructor() {
        this.steps = [
            {
                title: "ようこそ！",
                content: "Discord Bot Builderへようこそ！このツールでは、ブロックを組み合わせてDiscord Botのコードを自動生成できます。",
                target: "#app",
                position: "center"
            },
            {
                title: "ブロックエリア",
                content: "左側のエリアでブロックを組み立てます。ブロックをドラッグ&ドロップで配置し、接続できます。",
                target: ".left-panel",
                position: "right"
            },
            {
                title: "ブロックパレット",
                content: "様々なカテゴリのブロックがあります。DiscordブロックではBotのイベントやアクションを設定できます。",
                target: ".toolbox-header",
                position: "bottom"
            },
            {
                title: "コードプレビュー",
                content: "ブロックを組み立てると、ここに実際のコードがリアルタイムで表示されます。",
                target: "#tab-code",
                position: "left"
            },
            {
                title: "言語選択",
                content: "生成するコードの言語を選択できます。JavaScript、TypeScript、Pythonに対応しています。",
                target: ".language-selector",
                position: "bottom"
            },
            {
                title: "エクスポート",
                content: "生成したコードをダウンロードしたり、クリップボードにコピーできます。",
                target: ".export-panel",
                position: "left"
            },
            {
                title: "テンプレート",
                content: "事前に用意されたテンプレートから始めることもできます。",
                target: "#btn-templates",
                position: "bottom"
            },
            {
                title: "始めましょう！",
                content: "では、実際にブロックを組み立ててみましょう！左側からブロックをドラッグして配置してください。",
                target: "#blocklyDiv",
                position: "center"
            }
        ];
        
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
    }
    
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.showStep(this.currentStep);
    }
    
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            this.end();
            return;
        }
        
        const step = this.steps[stepIndex];
        this.createOverlay(step);
    }
    
    createOverlay(step) {
        // 既存のオーバーレイを削除
        if (this.overlay) {
            document.body.removeChild(this.overlay);
        }
        
        // オーバーレイを作成
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.innerHTML = this.createTutorialHTML(step);
        
        document.body.appendChild(this.overlay);
        
        // ターゲット要素をハイライト
        this.highlightTarget(step.target);
        
        // イベントリスナーを設定
        this.setupEventListeners();
    }
    
    createTutorialHTML(step) {
        return `
        <div class="tutorial-modal tutorial-position-${step.position}">
            <div class="tutorial-content">
                <h3>${step.title}</h3>
                <p>${step.content}</p>
                <div class="tutorial-progress">
                    <span>ステップ ${this.currentStep + 1}/${this.steps.length}</span>
                </div>
                <div class="tutorial-buttons">
                    ${this.currentStep > 0 ? 
                        '<button class="tutorial-btn tutorial-btn-prev">前へ</button>' : 
                        '<button class="tutorial-btn tutorial-btn-skip">スキップ</button>'}
                    ${this.currentStep < this.steps.length - 1 ? 
                        '<button class="tutorial-btn tutorial-btn-next">次へ</button>' : 
                        '<button class="tutorial-btn tutorial-btn-finish">完了</button>'}
                </div>
            </div>
            <div class="tutorial-arrow"></div>
        </div>
        `;
    }
    
    highlightTarget(targetSelector) {
        const target = document.querySelector(targetSelector);
        if (target) {
            target.classList.add('tutorial-highlight');
        }
    }
    
    removeHighlight() {
        const highlighted = document.querySelector('.tutorial-highlight');
        if (highlighted) {
            highlighted.classList.remove('tutorial-highlight');
        }
    }
    
    setupEventListeners() {
        const overlay = this.overlay;
        
        // 前へボタン
        const prevBtn = overlay.querySelector('.tutorial-btn-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.removeHighlight();
                this.currentStep--;
                this.showStep(this.currentStep);
            });
        }
        
        // 次へボタン
        const nextBtn = overlay.querySelector('.tutorial-btn-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.removeHighlight();
                this.currentStep++;
                this.showStep(this.currentStep);
            });
        }
        
        // 完了ボタン
        const finishBtn = overlay.querySelector('.tutorial-btn-finish');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                this.end();
            });
        }
        
        // スキップボタン
        const skipBtn = overlay.querySelector('.tutorial-btn-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.end();
            });
        }
        
        // オーバーレイクリックで次へ
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.removeHighlight();
                this.currentStep++;
                this.showStep(this.currentStep);
            }
        });
    }
    
    end() {
        this.isActive = false;
        this.removeHighlight();
        
        if (this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
        }
    }
    
    next() {
        if (this.isActive) {
            this.removeHighlight();
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }
    
    prev() {
        if (this.isActive && this.currentStep > 0) {
            this.removeHighlight();
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }
    
    getQuickStartGuide() {
        return [
            {
                title: "ステップ1: ブロックを配置",
                content: "左側のパレットからブロックをドラッグして、ワークスペースに配置します。",
                icon: "🧱"
            },
            {
                title: "ステップ2: ブロックを接続",
                content: "ブロックを互いに接続して、処理の流れを作成します。",
                icon: "🔗"
            },
            {
                title: "ステップ3: パラメータを設定",
                content: "各ブロックの設定（テキストや数値）を入力します。",
                icon: "⚙️"
            },
            {
                title: "ステップ4: コードを確認",
                content: "中央のペインで生成されたコードを確認します。",
                icon: "👁️"
            },
            {
                title: "ステップ5: エクスポート",
                content: "完成したコードをダウンロードして、自分で実行します。",
                icon: "📤"
            }
        ];
    }
    
    getExamples() {
        return [
            {
                title: "挨拶Bot",
                description: "メッセージに応答するシンプルなBot",
                steps: [
                    "1. 'Discord'カテゴリから 'トリガー' ブロックを配置",
                    "2. トリガーを 'messageCreate' に設定",
                    "3. 'メッセージを送信' ブロックを接続",
                    "4. 送信するメッセージを 'Hello!' に設定"
                ]
            },
            {
                title: "コマンドBot",
                description: "!pingコマンドに応答するBot",
                steps: [
                    "1. 'Discord'カテゴリから 'コマンド' ブロックを配置",
                    "2. コマンドを '!ping' に設定",
                    "3. 'メッセージを送信' ブロックを接続",
                    "4. 送信するメッセージを 'Pong!' に設定"
                ]
            },
            {
                title: "条件分岐Bot",
                description: "メッセージ内容によって異なる応答をするBot",
                steps: [
                    "1. 'messageCreate' トリガーを配置",
                    "2. 'メッセージに含まれていたら' ブロックを接続",
                    "3. 条件を 'こんにちは' に設定",
                    "4. 条件が真の時の処理を設定",
                    "5. 条件が偽の時の処理を設定（オプション）"
                ]
            }
        ];
    }
}

// チュートリアルCSSを動的に追加
function addTutorialStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .tutorial-modal {
            background: #2f3136;
            border-radius: 8px;
            padding: 20px;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            position: relative;
            border: 2px solid #5865F2;
        }
        
        .tutorial-content h3 {
            color: #5865F2;
            margin-top: 0;
            margin-bottom: 10px;
        }
        
        .tutorial-content p {
            color: #f6f6f7;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        
        .tutorial-progress {
            text-align: center;
            color: #99aab5;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .tutorial-buttons {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }
        
        .tutorial-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        }
        
        .tutorial-btn-prev {
            background: #4f545c;
            color: white;
        }
        
        .tutorial-btn-next,
        .tutorial-btn-finish {
            background: #5865F2;
            color: white;
        }
        
        .tutorial-btn-skip {
            background: transparent;
            color: #99aab5;
            border: 1px solid #4f545c;
        }
        
        .tutorial-btn:hover {
            opacity: 0.9;
        }
        
        .tutorial-highlight {
            position: relative;
            z-index: 10000 !important;
            box-shadow: 0 0 0 3px #57F287, 0 0 20px rgba(87, 242, 135, 0.5) !important;
            border-radius: 4px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 3px #57F287, 0 0 20px rgba(87, 242, 135, 0.5); }
            50% { box-shadow: 0 0 0 6px #57F287, 0 0 30px rgba(87, 242, 135, 0.8); }
            100% { box-shadow: 0 0 0 3px #57F287, 0 0 20px rgba(87, 242, 135, 0.5); }
        }
        
        .tutorial-arrow {
            position: absolute;
            width: 20px;
            height: 20px;
            background: #2f3136;
            transform: rotate(45deg);
        }
        
        .tutorial-position-top .tutorial-arrow {
            bottom: -10px;
            left: 50%;
            margin-left: -10px;
            border-right: 2px solid #5865F2;
            border-bottom: 2px solid #5865F2;
        }
        
        .tutorial-position-bottom .tutorial-arrow {
            top: -10px;
            left: 50%;
            margin-left: -10px;
            border-left: 2px solid #5865F2;
            border-top: 2px solid #5865F2;
        }
        
        .tutorial-position-left .tutorial-arrow {
            right: -10px;
            top: 50%;
            margin-top: -10px;
            border-top: 2px solid #5865F2;
            border-right: 2px solid #5865F2;
        }
        
        .tutorial-position-right .tutorial-arrow {
            left: -10px;
            top: 50%;
            margin-top: -10px;
            border-bottom: 2px solid #5865F2;
            border-left: 2px solid #5865F2;
        }
        
        .tutorial-position-center .tutorial-arrow {
            display: none;
        }
        
        .quick-start-guide {
            background: #2f3136;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .guide-step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #4f545c;
        }
        
        .guide-step:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .guide-step-icon {
            font-size: 24px;
            margin-right: 15px;
            min-width: 30px;
        }
        
        .guide-step-content h4 {
            color: #57F287;
            margin-top: 0;
            margin-bottom: 5px;
        }
        
        .guide-step-content p {
            color: #b9bbbe;
            margin: 0;
            font-size: 14px;
        }
    `;
    
    document.head.appendChild(style);
}

// ページ読み込み時にチュートリアルスタイルを追加
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTutorialStyles);
} else {
    addTutorialStyles();
}
