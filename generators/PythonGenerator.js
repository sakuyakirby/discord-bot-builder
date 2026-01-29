class PythonGenerator extends BaseGenerator {
    constructor() {
        super();
        this.indentString = '    ';
    }
    
    generateCode() {
        this.preprocessWorkspace();
        
        let code = '';
        
        // インポート
        code += this.generateImports();
        code += '\n';
        
        // 変数宣言
        code += this.generateVariableDeclarations();
        
        // クライアント設定
        code += this.generateClientSetup();
        
        // イベントハンドラー
        code += this.generateEventHandlers();
        
        // 実行
        code += this.generateRun();
        
        return code;
    }
    
    generateImports() {
        return `import discord
import asyncio
from discord.ext import commands`;
    }
    
    generateClientSetup() {
        return `\n\n# Botの設定
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix='!', intents=intents)\n`;
    }
    
    generateVariableDeclarations() {
        if (this.variables.size === 0) return '';
        
        const declarations = Array.from(this.variables).map(varName => {
            return `${varName} = None`;
        }).join('\n');
        
        return `${declarations}\n`;
    }
    
    generateEventHandlers() {
        let code = '';
        const blocks = this.workspace.getAllBlocks(false);
        
        // readyイベントは常に追加
        code += `\n# Bot起動時\n`;
        code += `@bot.event\n`;
        code += `async def on_ready():\n`;
        code += `${this.getIndent()}print(f'✅ Botが起動しました: {bot.user}')\n`;
        
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
            'messageCreate': 'on_message',
            'ready': 'on_ready',
            'messageReactionAdd': 'on_reaction_add',
            'guildMemberAdd': 'on_member_join',
            'guildMemberRemove': 'on_member_remove',
            'messageUpdate': 'on_message_edit',
            'messageDelete': 'on_message_delete'
        };
        
        const eventName = eventMap[triggerType] || `on_${triggerType}`;
        
        let code = `\n# ${triggerType}イベント\n`;
        code += `@bot.event\n`;
        code += `async def ${eventName}(${this.getEventParam(triggerType)}):\n`;
        
        this.indent();
        
        if (triggerType === 'messageCreate') {
            code += `${this.getIndent()}if message.author.bot:\n`;
            code += `${this.getIndent()}${this.indentString}return\n\n`;
        }
        
        const indentedActions = actions.split('\n')
            .map(line => line ? this.getIndent() + line : '')
            .join('\n');
        
        code += indentedActions;
        
        this.dedent();
        return code;
    }
    
    getEventParam(eventType) {
        const paramMap = {
            'messageCreate': 'message',
            'ready': '',
            'messageReactionAdd': 'reaction, user',
            'guildMemberAdd': 'member',
            'guildMemberRemove': 'member',
            'messageUpdate': 'before, after',
            'messageDelete': 'message'
        };
        
        return paramMap[eventType] || '*args';
    }
    
    generateSendMessageCode(message) {
        return `await message.channel.send(${message})\n`;
    }
    
    generateAddReactionCode(emoji) {
        return `await message.add_reaction(${emoji})\n`;
    }
    
    generateCommandCode(command, actions) {
        let code = `\n${this.getIndent()}# コマンド: ${command}\n`;
        code += `${this.getIndent()}if message.content.startswith('${command}'):\n`;
        
        this.indent();
        const indentedActions = actions.split('\n')
            .map(line => line ? this.getIndent() + line : '')
            .join('\n');
        
        code += indentedActions;
        this.dedent();
        
        return code;
    }
    
    generateIfContainsCode(text, thenActions) {
        let code = `\n${this.getIndent()}if ${text} in message.content:\n`;
        
        this.indent();
        const indentedActions = thenActions.split('\n')
            .map(line => line ? this.getIndent() + line : '')
            .join('\n');
        
        code += indentedActions;
        this.dedent();
        
        return code;
    }
    
    generateWaitCode(seconds) {
        return `await asyncio.sleep(${seconds})\n`;
    }
    
    generateSetVariableCode(varName, value) {
        return `${varName} = ${value}\n`;
    }
    
    generateCompareCode(a, b, op) {
        const operators = {
            'EQ': '==',
            'NEQ': '!=',
            'LT': '<',
            'LTE': '<=',
            'GT': '>',
            'GTE': '>='
        };
        
        return `${a} ${operators[op] || '=='} ${b}`;
    }
    
    generateIfCode(condition, thenActions) {
        let code = `\n${this.getIndent()}if ${condition}:\n`;
        
        this.indent();
        const indentedActions = thenActions.split('\n')
            .map(line => line ? this.getIndent() + line : '')
            .join('\n');
        
        code += indentedActions;
        this.dedent();
        
        return code;
    }
    
    generateRun() {
        return `\n# Botの実行\nbot.run('YOUR_BOT_TOKEN_HERE')`;
    }
}
