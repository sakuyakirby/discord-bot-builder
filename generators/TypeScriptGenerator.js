class TypeScriptGenerator extends BaseGenerator {
    constructor() {
        super();
        this.indentString = '    ';
    }
    
    generateCode() {
        this.preprocessWorkspace();
        
        let code = '';
        
        // インポート
        code += this.generateImports();
        
        // 環境変数タイプ
        code += this.generateEnvironmentType();
        
        // 変数宣言
        code += this.generateVariableDeclarations();
        
        // クライアント設定
        code += this.generateClientSetup();
        
        // イベントハンドラー
        code += this.generateEventHandlers();
        
        // ログイン
        code += this.generateLogin();
        
        return code;
    }
    
    generateImports() {
        return `import { Client, GatewayIntentBits, EmbedBuilder, Message } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();\n\n`;
    }
    
    generateEnvironmentType() {
        return `// 環境変数の型定義
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
        }
    }
}\n\n`;
    }
    
    generateClientSetup() {
        return `// クライアントの設定
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});\n\n`;
    }
    
    generateVariableDeclarations() {
        if (this.variables.size === 0) return '';
        
        const declarations = Array.from(this.variables).map(varName => {
            return `let ${varName}: any = null;`;
        }).join('\n');
        
        return `${declarations}\n\n`;
    }
    
    generateEventHandlers() {
        let code = '';
        const blocks = this.workspace.getAllBlocks(false);
        
        // readyイベントは常に追加
        code += `// Bot起動時\n`;
        code += `client.on('ready', () => {\n`;
        code += `${this.getIndent()}console.log(\`✅ Botが起動しました: \${client.user?.tag}\`);\n`;
        code += `});\n\n`;
        
        // その他のイベント
        const eventBlocks = blocks.filter(block => block.type === 'discord_trigger');
        
        eventBlocks.forEach(block => {
            const triggerType = block.getFieldValue('TRIGGER_TYPE');
            const actions = this.generateStatement(block, 'ACTIONS');
            
            if (actions.trim()) {
                code += this.generateEventCode(triggerType, actions);
            }
        });
        
        return code;
    }
    
    generateEventCode(triggerType, actions) {
        const eventMap = {
            'messageCreate': 'messageCreate',
            'ready': 'ready',
            'messageReactionAdd': 'messageReactionAdd',
            'guildMemberAdd': 'guildMemberAdd',
            'guildMemberRemove': 'guildMemberRemove',
            'messageUpdate': 'messageUpdate',
            'messageDelete': 'messageDelete',
            'voiceStateUpdate': 'voiceStateUpdate'
        };
        
        const eventName = eventMap[triggerType] || triggerType;
        
        let code = `// ${triggerType}
