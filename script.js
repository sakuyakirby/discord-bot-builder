// メインアプリケーション
class DiscordBotBuilderApp {
    constructor() {
        this.workspace = null;
        this.currentLanguage = 'javascript';
        this.currentCode = '';
        this.generators = {
            javascript: new JavaScriptGenerator(),
            python: new PythonGenerator(),
            typescript: new TypeScriptGenerator()
        };
        
        this.init();
    }
    
    init() {
        // DOM要素の取得
        this.elements = {
            blocklyDiv: document.getElementById('blocklyDiv'),
            generatedCode: document.getElementById('generated-code'),
            languageSelect: document.getElementById('language-select'),
            btnCopy: document.getElementById('btn-copy'),
            btnFormat: document.getElementById('btn-format'),
            btnDownload: document.getElementById('btn-download')
        };
        
        // Blocklyの初期化
        this.initBlockly();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // デフォルトブロックを配置
        this.setupDefaultBlocks();
    }
    
    initBlockly() {
        // カスタムブロックを読み込み
        this.loadCustomBlocks();
        
        // ワークスペースの作成
        this.workspace = Blockly.inject(this.elements.blocklyDiv, {
            toolbox: this.createToolbox(),
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            },
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            trashcan: true,
            renderer: 'zelos'
        });
        
        // 変更イベントの監視
        this.workspace.addChangeListener(() => this.onWorkspaceChanged());
    }
    
    createToolbox() {
        return `
<xml id="toolbox" style="display: none">
    <category name="🤖 Discord" colour="230">
        <block type="discord_trigger"></block>
        <block type="discord_send_message"></block>
        <block type="discord_add_reaction"></block>
        <block type="discord_create_embed"></block>
        <block type="discord_command"></block>
    </category>
    
    <category name="🔧 ロジック" colour="210">
        <block type="controls_if"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="controls_repeat_ext"></block>
        <block type="controls_whileUntil"></block>
    </category>
    
    <category name="📊 変数" colour="330" custom="VARIABLE"></category>
    
    <category name="📝 テキスト" colour="160">
        <block type="text"></block>
        <block type="text_join"></block>
        <block type="text_length"></block>
        <block type="text_contains"></block>
    </category>
    
    <category name="🔢 計算" colour="230">
        <block type="math_number"></block>
        <block type="math_arithmetic"></block>
        <block type="math_random_int"></block>
    </category>
    
    <category name="🔄 関数" colour="290" custom="PROCEDURE"></category>
    
    <sep></sep>
    <category name="📁 テンプレート" colour="120">
        <button text="ウェルカムBot" callbackKey="load_welcome_bot"></button>
        <button text="音楽Bot" callbackKey="load_music_bot"></button>
        <button text="モデレーションボット" callbackKey="load_moderation_bot"></button>
    </category>
</xml>`;
    }
    
    onWorkspaceChanged() {
        // コードを生成
        this.generateCode();
        
        // コードを表示
        this.displayCode();
    }
    
    generateCode() {
        const generator = this.generators[this.currentLanguage];
        const code = generator.workspaceToCode(this.workspace);
        this.currentCode = code;
        return code;
    }
    
    displayCode() {
        const codeElement = this.elements.generatedCode;
        codeElement.textContent = this.currentCode;
        codeElement.className = `language-${this.currentLanguage}`;
        
        // シンタックスハイライト
        if (window.hljs) {
            hljs.highlightElement(codeElement);
        }
    }
    
    async copyCodeToClipboard() {
        try {
            await navigator.clipboard.writeText(this.currentCode);
            this.showToast('コードをコピーしました！', 'success');
        } catch (err) {
            console.error('コピーに失敗しました:', err);
            this.showToast('コピーに失敗しました', 'error');
        }
    }
    
    downloadCode() {
        const extension = {
            javascript: 'js',
            python: 'py',
            typescript: 'ts'
        }[this.currentLanguage];
        
        const filename = `discord-bot-${Date.now()}.${extension}`;
        const blob = new Blob([this.currentCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`コードをダウンロードしました: ${filename}`, 'success');
    }
    
    setupEventListeners() {
        // 言語変更
        this.elements.languageSelect.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.generateCode();
            this.displayCode();
        });
        
        // コピーボタン
        this.elements.btnCopy.addEventListener('click', () => this.copyCodeToClipboard());
        
        // ダウンロードボタン
        this.elements.btnDownload.addEventListener('click', () => this.downloadCode());
        
        // フォーマットボタン
        this.elements.btnFormat.addEventListener('click', () => {
            this.currentCode = formatCode(this.currentCode, this.currentLanguage);
            this.displayCode();
        });
    }
    
    setupDefaultBlocks() {
        // デフォルトでいくつかのブロックを配置
        const defaultXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="discord_trigger" x="50" y="50">
        <field name="TRIGGER_TYPE">messageCreate</field>
        <statement name="ACTIONS">
            <block type="discord_send_message">
                <value name="MESSAGE">
                    <block type="text">
                        <field name="TEXT">Hello World!</field>
                    </block>
                </value>
            </block>
        </statement>
    </block>
</xml>`;
        
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(defaultXml), this.workspace);
    }
    
    showToast(message, type = 'info') {
        // トースト通知の実装
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DiscordBotBuilderApp();
});
