// Discord用ブロック定義
Blockly.Blocks['discord_trigger'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("トリガー")
            .appendField(new Blockly.FieldDropdown([
                ["メッセージが送信された時", "messageCreate"],
                ["Botが起動した時", "ready"],
                ["リアクションが追加された時", "messageReactionAdd"],
                ["メンバーが参加した時", "guildMemberAdd"],
                ["メンバーが退出した時", "guildMemberRemove"],
                ["メッセージが編集された時", "messageUpdate"],
                ["メッセージが削除された時", "messageDelete"],
                ["ボイスチャンネルに参加した時", "voiceStateUpdate"]
            ]), "TRIGGER_TYPE");
        this.appendStatementInput("ACTIONS")
            .setCheck(null)
            .appendField("以下の処理を実行:");
        this.setColour(230);
        this.setTooltip("Discordイベントを設定します");
        this.setHelpUrl("https://discord.js.org/#/docs/discord.js/main/class/Client");
    }
};

Blockly.Blocks['discord_send_message'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("メッセージを送信:");
        this.appendValueInput("MESSAGE")
            .setCheck("String");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("メッセージを送信します");
    }
};

Blockly.Blocks['discord_add_reaction'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("リアクションを追加:");
        this.appendValueInput("EMOJI")
            .setCheck("String")
            .appendField("絵文字");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("メッセージにリアクションを追加します");
    }
};

Blockly.Blocks['discord_create_embed'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("埋め込みメッセージを作成");
        this.appendValueInput("TITLE")
            .setCheck("String")
            .appendField("タイトル:");
        this.appendValueInput("DESCRIPTION")
            .setCheck("String")
            .appendField("説明:");
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField("色（例: #FF0000）:");
        this.appendStatementInput("FIELDS")
            .setCheck(null)
            .appendField("フィールド:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("埋め込みメッセージを作成します");
    }
};

Blockly.Blocks['discord_command'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("コマンド")
            .appendField(new Blockly.FieldTextInput("!ping"), "COMMAND")
            .appendField("が実行された時");
        this.appendStatementInput("ACTIONS")
            .setCheck(null)
            .appendField("以下の処理を実行:");
        this.setColour(230);
        this.setTooltip("カスタムコマンドを作成します");
    }
};

Blockly.Blocks['discord_if_message_contains'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("メッセージに");
        this.appendDummyInput()
            .appendField("が含まれていたら");
        this.appendStatementInput("THEN")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("メッセージの内容をチェックします");
    }
};

Blockly.Blocks['discord_get_message_content'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("メッセージの内容");
        this.setOutput(true, "String");
        this.setColour(230);
        this.setTooltip("受信したメッセージの内容を取得します");
    }
};

Blockly.Blocks['discord_get_author'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("メッセージの送信者");
        this.setOutput(true, "String");
        this.setColour(230);
        this.setTooltip("メッセージの送信者を取得します");
    }
};

Blockly.Blocks['discord_wait'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("待つ")
            .appendField(new Blockly.FieldNumber(1, 0.1, 60, 0.1), "SECONDS")
            .appendField("秒");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("指定した秒数待機します");
    }
};
