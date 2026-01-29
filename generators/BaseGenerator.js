// 基本ジェネレータークラス
class BaseGenerator {
    constructor() {
        this.indentLevel = 0;
        this.indentString = '    ';
        this.variables = new Set();
        this.imports = new Set();
        this.functions = new Map();
        this.currentEvent = null;
    }
    
    generate(workspace) {
        this.workspace = workspace;
        this.variables.clear();
        this.imports.clear();
        this.functions.clear();
        
        this.preprocessWorkspace();
        return this.generateCode();
    }
    
    preprocessWorkspace() {
        // ワークスペースをスキャンして変数や関数を収集
        const blocks = this.workspace.getAllBlocks(false);
        
        blocks.forEach(block => {
            switch(block.type) {
                case 'create_variable':
                    this.variables.add(block.getFieldValue('VAR_NAME'));
                    break;
                case 'create_list':
                    this.variables.add(block.getFieldValue('LIST_NAME'));
                    break;
                case 'discord_trigger':
                    this.currentEvent = block.getFieldValue('TRIGGER_TYPE');
                    break;
            }
        });
    }
    
    generateCode() {
        // 継承先で実装
        return '';
    }
    
    indent() {
        this.indentLevel++;
        return this;
    }
    
    dedent() {
        this.indentLevel = Math.max(0, this.indentLevel - 1);
        return this;
    }
    
    getIndent() {
        return this.indentString.repeat(this.indentLevel);
    }
    
    generateBlockCode(block) {
        if (!block) return '';
        
        const methodName = `generate${this.capitalize(block.type)}`;
        if (this[methodName]) {
            return this[methodName](block);
        }
        
        // デフォルトの処理
        return this.generateDefaultBlock(block);
    }
    
    generateDefaultBlock(block) {
        console.warn(`No generator for block type: ${block.type}`);
        return '';
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    escapeString(str) {
        return str.replace(/\\/g, '\\\\')
                 .replace(/"/g, '\\"')
                 .replace(/\n/g, '\\n')
                 .replace(/\r/g, '\\r')
                 .replace(/\t/g, '\\t');
    }
    
    // 共通ブロックのジェネレーター
    generateDiscord_trigger(block) {
        const triggerType = block.getFieldValue('TRIGGER_TYPE');
        const actions = this.generateStatement(block, 'ACTIONS');
        
        return this.generateEventCode(triggerType, actions);
    }
    
    generateDiscord_send_message(block) {
        const message = this.generateValue(block, 'MESSAGE');
        return this.generateSendMessageCode(message);
    }
    
    generateDiscord_add_reaction(block) {
        const emoji = this.generateValue(block, 'EMOJI');
        return this.generateAddReactionCode(emoji);
    }
    
    generateDiscord_command(block) {
        const command = block.getFieldValue('COMMAND');
        const actions = this.generateStatement(block, 'ACTIONS');
        
        return this.generateCommandCode(command, actions);
    }
    
    generateDiscord_if_message_contains(block) {
        const text = this.generateValue(block, 'TEXT');
        const thenActions = this.generateStatement(block, 'THEN');
        
        return this.generateIfContainsCode(text, thenActions);
    }
    
    generateDiscord_wait(block) {
        const seconds = block.getFieldValue('SECONDS');
        return this.generateWaitCode(seconds);
    }
    
    generateVariables_set(block) {
        const varName = block.getFieldValue('VAR');
        const value = this.generateValue(block, 'VALUE');
        return this.generateSetVariableCode(varName, value);
    }
    
    generateLogic_compare(block) {
        const a = this.generateValue(block, 'A');
        const b = this.generateValue(block, 'B');
        const op = block.getFieldValue('OP');
        
        return this.generateCompareCode(a, b, op);
    }
    
    generateControls_if(block) {
        const condition = this.generateValue(block, 'IF0');
        const thenActions = this.generateStatement(block, 'DO0');
        
        return this.generateIfCode(condition, thenActions);
    }
    
    // ヘルパーメソッド
    generateValue(block, inputName) {
        const input = block.getInput(inputName);
        if (!input || !input.connection) {
            const field = block.getField(inputName);
            return field ? field.getValue() : 'null';
        }
        
        const targetBlock = input.connection.targetBlock();
        if (!targetBlock) return 'null';
        
        return this.generateBlockCode(targetBlock);
    }
    
    generateStatement(block, inputName) {
        const input = block.getInput(inputName);
        if (!input || !input.connection) return '';
        
        const targetBlock = input.connection.targetBlock();
        if (!targetBlock) return '';
        
        let code = '';
        let currentBlock = targetBlock;
        
        while (currentBlock) {
            code += this.generateBlockCode(currentBlock);
            const nextBlock = currentBlock.getNextBlock();
            if (nextBlock) {
                currentBlock = nextBlock;
            } else {
                break;
            }
        }
        
        return code;
    }
}
