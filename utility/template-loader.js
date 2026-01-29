// テンプレートローダー
class TemplateLoader {
    constructor() {
        this.templates = {
            'welcome-bot': {
                name: 'ウェルカムBot',
                description: '新規メンバーを歓迎するシンプルなBot',
                language: 'javascript',
                blocks: [
                    {
                        type: 'discord_trigger',
                        fields: { TRIGGER_TYPE: 'guildMemberAdd' },
                        position: { x: 50, y: 50 },
                        children: {
                            ACTIONS: [
                                {
                                    type: 'discord_send_message',
                                    values: {
                                        MESSAGE: {
                                            type: 'text',
                                            fields: { TEXT: 'ようこそ {user} さん！' }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            'moderation-bot': {
                name: 'モデレーションボット',
                description: '基本的なモデレーション機能を持つBot',
                language: 'javascript',
                blocks: [
                    {
                        type: 'discord_trigger',
                        fields: { TRIGGER_TYPE: 'messageCreate' },
                        position: { x: 50, y: 50 },
                        children: {
                            ACTIONS: [
                                {
                                    type: 'discord_if_message_contains',
                                    values: {
                                        TEXT: {
                                            type: 'text',
                                            fields: { TEXT: '悪い言葉' }
                                        }
                                    },
                                    children: {
                                        THEN: [
                                            {
                                                type: 'discord_send_message',
                                                values: {
                                                    MESSAGE: {
                                                        type: 'text',
                                                        fields: { TEXT: '不適切なメッセージは削除されます' }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            'music-bot': {
                name: '音楽Bot',
                description: '基本的な音楽再生機能',
                language: 'javascript',
                blocks: [
                    {
                        type: 'discord_command',
                        fields: { COMMAND: '!play' },
                        position: { x: 50, y: 50 },
                        children: {
                            ACTIONS: [
                                {
                                    type: 'discord_send_message',
                                    values: {
                                        MESSAGE: {
                                            type: 'text',
                                            fields: { TEXT: '音楽を再生します！' }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            'poll-bot': {
                name: '投票Bot',
                description: '簡単な投票機能',
                language: 'javascript',
                blocks: [
                    {
                        type: 'discord_command',
                        fields: { COMMAND: '!poll' },
                        position: { x: 50, y: 50 },
                        children: {
                            ACTIONS: [
                                {
                                    type: 'discord_send_message',
                                    values: {
                                        MESSAGE: {
                                            type: 'text',
                                            fields: { TEXT: '投票を開始します！' }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            'level-bot': {
                name: 'レベルBot',
                description: 'チャット経験値システム',
                language: 'javascript',
                blocks: [
                    {
                        type: 'discord_trigger',
                        fields: { TRIGGER_TYPE: 'messageCreate' },
                        position: { x: 50, y: 50 },
                        children: {
                            ACTIONS: [
                                {
                                    type: 'discord_send_message',
                                    values: {
                                        MESSAGE: {
                                            type: 'text',
                                            fields: { TEXT: '経験値が上がりました！' }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        };
    }
    
    loadTemplate(templateId) {
        return this.templates[templateId] || null;
    }
    
    getAllTemplates() {
        return Object.entries(this.templates).map(([id, template]) => ({
            id,
            ...template
        }));
    }
    
    saveTemplate(name, description, language, workspace) {
        const blocks = workspace.getAllBlocks(false);
        const template = {
            name,
            description,
            language,
            blocks: this.extractBlocksData(blocks)
        };
        
        const templateId = name.toLowerCase().replace(/\s+/g, '-');
        this.templates[templateId] = template;
        
        return templateId;
    }
    
    extractBlocksData(blocks) {
        return blocks.map(block => {
            const data = {
                type: block.type,
                fields: {},
                position: { x: block.relativeCoords.x, y: block.relativeCoords.y }
            };
            
            // フィールドの収集
            block.inputList.forEach(input => {
                input.fieldRow.forEach(field => {
                    if (field.name) {
                        data.fields[field.name] = field.getValue();
                    }
                });
            });
            
            // 子ブロックの収集
            block.inputList.forEach(input => {
                if (input.connection) {
                    const targetBlock = input.connection.targetBlock();
                    if (targetBlock) {
                        if (!data.children) data.children = {};
                        data.children[input.name] = [this.extractBlockData(targetBlock)];
                        
                        // 次のブロックも収集
                        let nextBlock = targetBlock.getNextBlock();
                        while (nextBlock) {
                            data.children[input.name].push(this.extractBlockData(nextBlock));
                            nextBlock = nextBlock.getNextBlock();
                        }
                    }
                }
            });
            
            return data;
        });
    }
    
    extractBlockData(block) {
        const data = {
            type: block.type,
            fields: {}
        };
        
        // フィールドの収集
        block.inputList.forEach(input => {
            input.fieldRow.forEach(field => {
                if (field.name) {
                    data.fields[field.name] = field.getValue();
                }
            });
        });
        
        // 値入力の収集
        block.inputList.forEach(input => {
            if (input.connection && input.name) {
                const targetBlock = input.connection.targetBlock();
                if (targetBlock) {
                    if (!data.values) data.values = {};
                    data.values[input.name] = this.extractBlockData(targetBlock);
                }
            }
        });
        
        // ステートメントの収集
        block.inputList.forEach(input => {
            if (input.connection && input.name) {
                const targetBlock = input.connection.targetBlock();
                if (targetBlock) {
                    if (!data.children) data.children = {};
                    data.children[input.name] = [this.extractBlockData(targetBlock)];
                    
                    // 次のブロックも収集
                    let nextBlock = targetBlock.getNextBlock();
                    while (nextBlock) {
                        data.children[input.name].push(this.extractBlockData(nextBlock));
                        nextBlock = nextBlock.getNextBlock();
                    }
                }
            }
        });
        
        return data;
    }
    
    applyTemplateToWorkspace(workspace, template) {
        BlocklyUtils.clearWorkspace(workspace);
        
        if (template.blocks && Array.isArray(template.blocks)) {
            template.blocks.forEach(blockData => {
                this.createBlockFromData(workspace, blockData);
            });
        }
    }
    
    createBlockFromData(workspace, blockData, parentBlock = null) {
        const block = workspace.newBlock(blockData.type);
        
        // フィールドの設定
        if (blockData.fields) {
            Object.entries(blockData.fields).forEach(([fieldName, value]) => {
                const field = block.getField(fieldName);
                if (field) {
                    field.setValue(value);
                }
            });
        }
        
        // 位置の設定
        if (blockData.position) {
            block.moveBy(blockData.position.x, blockData.position.y);
        } else if (parentBlock) {
            block.moveBy(parentBlock.getRelativeToSurfaceXY().x + 50, 
                        parentBlock.getRelativeToSurfaceXY().y + 50);
        }
        
        // 値入力の設定
        if (blockData.values) {
            Object.entries(blockData.values).forEach(([inputName, valueBlockData]) => {
                const input = block.getInput(inputName);
                if (input) {
                    const valueBlock = this.createBlockFromData(workspace, valueBlockData, block);
                    input.connection.connect(valueBlock.outputConnection);
                }
            });
        }
        
        // ステートメントの設定
        if (blockData.children) {
            Object.entries(blockData.children).forEach(([inputName, childBlocksData]) => {
                if (childBlocksData && childBlocksData.length > 0) {
                    const input = block.getInput(inputName);
                    if (input) {
                        let previousBlock = null;
                        
                        childBlocksData.forEach((childBlockData, index) => {
                            const childBlock = this.createBlockFromData(workspace, childBlockData, block);
                            
                            if (index === 0) {
                                input.connection.connect(childBlock.previousConnection);
                            } else if (previousBlock) {
                                previousBlock.nextConnection.connect(childBlock.previousConnection);
                            }
                            
                            previousBlock = childBlock;
                        });
                    }
                }
            });
        }
        
        return block;
    }
    
    exportTemplateAsJson(templateId) {
        const template = this.templates[templateId];
        if (!template) return null;
        
        return JSON.stringify(template, null, 2);
    }
    
    importTemplateFromJson(jsonString) {
        try {
            const template = JSON.parse(jsonString);
            if (!template.name || !template.blocks) {
                throw new Error('無効なテンプレート形式です');
            }
            
            const templateId = template.name.toLowerCase().replace(/\s+/g, '-');
            this.templates[templateId] = template;
            
            return templateId;
        } catch (error) {
            console.error('テンプレートのインポートに失敗しました:', error);
            return null;
        }
    }
}
