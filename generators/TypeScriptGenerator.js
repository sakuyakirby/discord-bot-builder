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
        
        let code = `// ${triggerType}イベント\n`;
        code += `client.on('${eventName}', async (${this.getEventParamWithType(triggerType)}) => {\n`;
        
        this.indent();
        
        if (triggerType === 'messageCreate') {
            code += `${this.getIndent()}if (message.author.bot) return;\n\n`;
        }
        
        const indentedActions = actions.split('\n')
            .map(line => line ? this.getIndent() + line : '')
            .join('\n');
        
        code += indentedActions;
        
        this.dedent();
        code += `});\n\n`;
        
        return code;
    }
    
    getEventParamWithType(eventType) {
        const paramMap = {
            'messageCreate': 'message: Message',
            'ready': '',
            'messageReactionAdd': 'reaction: MessageReaction, user: User',
            'guildMemberAdd': 'member: GuildMember',
            'guildMemberRemove': 'member: GuildMember',
            'messageUpdate': 'oldMessage: Message, newMessage: Message',
            'messageDelete': 'message: Message',
            'voiceStateUpdate': 'oldState: VoiceState, newState: VoiceState'
        };
        
        return paramMap[eventType] || '...args: any[]';
    }
    
    generateSendMessageCode(message) {
        return `await message.channel.send(${message});\n`;
    }
    
    generateAddReactionCode(emoji) {
        return `await message.react(${emoji});\n`;
    }
    
    generateCommandCode(command, actions) {
        let code = `\n${this.getIndent()}// コマンド: ${command}\n`;
        code += `${this.getIndent()}if (message.content.startsWith('${command}')) {\n`;
        
        this.indent();
        const indentedActions = actions.split('\n')
            .map(line => line ? this.getIndent() + line : '')
            .join('\n');
        
        code += indentedActions;
        this.dedent();
        
        code += `${this.getIndent()}}\n`;
        return code;
    }
    
    generateIfContainsCode(text, thenActions) {
        let code = `\n${this.getIndent()}if (message.content.includes(${text})) {\n`;
        
        this.indent();
        const indentedActions = thenActions.split('\n')
            .map(line => line ? this.getIndent() + line : '')
            .join('\n');
        
        code += indentedActions;
        this.dedent();
        
        code += `${this.getIndent()}}\n`;
        return code;
    }
    
    generateWaitCode(seconds) {
        return `await new Promise<void>(resolve => setTimeout(resolve, ${seconds * 1000}));\n`;
    }
    
    generateSetVariableCode(varName, value) {
        return `${varName} = ${value};\n`;
    }
    
    generateCompareCode(a, b, op) {
        const operators = {
            'EQ': '===',
            'NEQ': '!==',
            'LT': '<',
            'LTE': '<=',
            'GT': '>',
            'GTE': '>='
        };
        
        return `${a} ${operators[op] || '==='} ${b}`;
    }
    
    generateIfCode(condition, thenActions) {
        let code = `\n${this.getIndent()}if (${condition}) {\n`;
        
        this.indent();
        const indentedActions = thenActions.split('\n')
            .map(line => line ? this.getIndent() + line : '')
            .join('\n');
        
        code += indentedActions;
        this.dedent();
        
        code += `${this.getIndent()}}\n`;
        return code;
    }
    
    generateLogin() {
        return `\n// Botのログイン
client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('Bot logged in successfully'))
    .catch(console.error);`;
    }
}
