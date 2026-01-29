// Blocklyユーティリティ関数
class BlocklyUtils {
    static setupWorkspace(workspaceElementId, toolboxElementId) {
        const workspaceDiv = document.getElementById(workspaceElementId);
        const toolbox = document.getElementById(toolboxElementId);
        
        return Blockly.inject(workspaceDiv, {
            toolbox: toolbox,
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
            renderer: 'zelos',
            theme: this.createCustomTheme()
        });
    }
    
    static createCustomTheme() {
        return Blockly.Theme.defineTheme('discord-theme', {
            'base': Blockly.Themes.Zelos,
            'componentStyles': {
                'workspaceBackgroundColour': '#1e1f29',
                'toolboxBackgroundColour': '#2f3136',
                'toolboxForegroundColour': '#ffffff',
                'flyoutBackgroundColour': '#36393f',
                'flyoutForegroundColour': '#ffffff',
                'flyoutOpacity': 0.9,
                'scrollbarColour': '#5865F2',
                'insertionMarkerColour': '#57F287',
                'insertionMarkerOpacity': 0.3
            }
        });
    }
    
    static createDefaultToolbox() {
        return `
<xml id="toolbox" style="display: none">
    <category name="🤖 Discord" colour="230" custom="DISCORD_CATEGORY">
        <block type="discord_trigger"></block>
        <block type="discord_send_message"></block>
        <block type="discord_add_reaction"></block>
        <block type="discord_create_embed"></block>
        <block type="discord_command"></block>
        <block type="discord_if_message_contains"></block>
        <block type="discord_wait"></block>
        <block type="discord_get_message_content"></block>
        <block type="discord_get_author"></block>
    </category>
    
    <category name="🔧 ロジック" colour="210">
        <block type="controls_if"></block>
        <block type="controls_if_else"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_negate"></block>
        <block type="controls_repeat_ext"></block>
        <block type="controls_whileUntil"></block>
    </category>
    
    <category name="📊 変数" colour="330" custom="VARIABLE"></category>
    
    <category name="📝 テキスト" colour="160">
        <block type="text"></block>
        <block type="text_join"></block>
        <block type="text_length"></block>
        <block type="text_contains"></block>
        <block type="text_isEmpty"></block>
        <block type="text_indexOf"></block>
    </category>
    
    <category name="🔢 計算" colour="230">
        <block type="math_number"></block>
        <block type="math_arithmetic"></block>
        <block type="math_random_int"></block>
        <block type="math_round"></block>
        <block type="math_modulo"></block>
    </category>
    
    <category name="🔄 関数" colour="290" custom="PROCEDURE"></category>
    
    <sep></sep>
    
    <category name="📁 テンプレート" colour="120">
        <button text="ウェルカムBot" callbackKey="load_welcome_bot"></button>
        <button text="音楽Bot" callbackKey="load_music_bot"></button>
        <button text="モデレーションボット" callbackKey="load_moderation_bot"></button>
        <button text="投票Bot" callbackKey="load_poll_bot"></button>
        <button text="レベルBot" callbackKey="load_level_bot"></button>
    </category>
</xml>`;
    }
    
    static saveWorkspace(workspace) {
        const data = Blockly.serialization.workspaces.save(workspace);
        return JSON.stringify(data);
    }
    
    static loadWorkspace(workspace, dataString) {
        try {
            const data = JSON.parse(dataString);
            Blockly.serialization.workspaces.load(data, workspace);
            return true;
        } catch (error) {
            console.error('ワークスペースの読み込みに失敗しました:', error);
            return false;
        }
    }
    
    static exportAsXml(workspace) {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        return Blockly.Xml.domToPrettyText(xml);
    }
    
    static importFromXml(workspace, xmlString) {
        try {
            const xml = Blockly.utils.xml.textToDom(xmlString);
            Blockly.Xml.domToWorkspace(xml, workspace);
            return true;
        } catch (error) {
            console.error('XMLの読み込みに失敗しました:', error);
            return false;
        }
    }
    
    static clearWorkspace(workspace) {
        workspace.clear();
    }
    
    static addDefaultBlocks(workspace) {
        const defaultXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="discord_trigger" x="100" y="100">
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
        
        this.importFromXml(workspace, defaultXml);
    }
    
    static registerToolboxCallbacks(workspace, callbacks) {
        const toolbox = workspace.getToolbox();
        
        Object.entries(callbacks).forEach(([key, callback]) => {
            toolbox.registerCallback(key, callback);
        });
    }
    
    static getBlocksByType(workspace, type) {
        return workspace.getAllBlocks(false).filter(block => block.type === type);
    }
    
    static createBlockFromTemplate(workspace, template) {
        const block = workspace.newBlock(template.type);
        
        if (template.fields) {
            Object.entries(template.fields).forEach(([fieldName, value]) => {
                const field = block.getField(fieldName);
                if (field) {
                    field.setValue(value);
                }
            });
        }
        
        if (template.position) {
            block.moveBy(template.position.x, template.position.y);
        }
        
        return block;
    }
}
