class JavaScriptGenerator extends BaseGenerator {
    constructor() {
        super();
        this.indentString = '    ';
    }
    
    generateCode() {
        this.preprocessWorkspace();
        
        let code = '';
        
        // インポート
        code += this.generateImports();
        
        // クライアント設定
        code += this.generateClientSetup();
        
        // 変数宣言
        code += this.generateVariableDeclarations();
        
        // イベントハンドラー
        code += this.generateEventHandlers();
        
        // ログイン
        code += this.generateLogin();
        
        return code;
    }
    
    generateImports() {
        if (this.imports.size > 0) {
            return Array.from(this.imports).map(imp => {
                return `const ${imp} = require('${imp}');\n`;
            }).join('');
        }
        return `const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');\n\n`;
    }
    
    generateClientSetup() {
        return `const client = new Client({
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
            return `let ${varName} = null;`;
        }).join('\n');
        
        return `${declarations}\n\n`;
    }
    
    generateEventHandlers() {
        let code = '';
        const blocks = this.workspace.getAllBlocks(false);
        
        // readyイベントは常に追加
        code += `// Bot起動時\n`;
        code += `client.on('ready', () => {\n`;
        code += `${this.getIndent()}console.log(\`✅ Botが起動しました: \${client.user.tag}\`);\n`;
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
        code += `client.on('${eventName}', async (${this.getEventParam(triggerType)}) => {\n`;
        
        this.indent();
        
        if (triggerType === 'messageCreate') {
            code += `${this.getIndent()}if (${this.getEventParam(triggerType)}.author.bot) return;\n\n`;
        }
        
        const indentedActions = actions.split('\n')
            .map(line => line ? this.getIndent() + line : '')
            .join('\n');
        
        code += indentedActions;
        
        this.dedent();
        code += `\n});\n\n`;
        
        return code;
    }
    
    getEventParam(eventType) {
        const paramMap = {
            'messageCreate': 'message',
            'ready': '',
            'messageReactionAdd': 'reaction, user',
            'guildMemberAdd': 'member',
            'guildMemberRemove': 'member',
            'messageUpdate': 'oldMessage, newMessage',
            'messageDelete': 'message',
            'voiceStateUpdate': 'oldState, newState'
        };
        
        return paramMap[eventType] || '...args';
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
        return `await new Promise(resolve => setTimeout(resolve, ${seconds * 1000}));\n`;
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
        return `\n// Botのログイン\nclient.login('YOUR_BOT_TOKEN_HERE');\n`;
    }
}
