// 変数ブロック
Blockly.Blocks['variables_get'] = {
    init: function() {
        this.jsonInit({
            "message0": "%1",
            "args0": [
                {
                    "type": "field_variable",
                    "name": "VAR",
                    "variable": "%{BKY_VARIABLES_DEFAULT_NAME}"
                }
            ],
            "output": null,
            "colour": 330,
            "helpUrl": "%{BKY_VARIABLES_GET_HELPURL}"
        });
    }
};

Blockly.Blocks['variables_set'] = {
    init: function() {
        this.jsonInit({
            "message0": "%1 を %2 に設定",
            "args0": [
                {
                    "type": "field_variable",
                    "name": "VAR",
                    "variable": "%{BKY_VARIABLES_DEFAULT_NAME}"
                },
                {
                    "type": "input_value",
                    "name": "VALUE"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 330,
            "helpUrl": "%{BKY_VARIABLES_SET_HELPURL}"
        });
    }
};

// カスタム変数ブロック
Blockly.Blocks['create_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("変数")
            .appendField(new Blockly.FieldTextInput("変数名"), "VAR_NAME")
            .appendField("を作成");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("新しい変数を作成します");
    }
};

Blockly.Blocks['set_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("変数")
            .appendField(new Blockly.FieldVariable("変数名"), "VAR_NAME")
            .appendField("に");
        this.appendValueInput("VALUE")
            .setCheck(null);
        this.appendDummyInput()
            .appendField("を設定");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("変数に値を設定します");
    }
};

Blockly.Blocks['get_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("変数")
            .appendField(new Blockly.FieldVariable("変数名"), "VAR_NAME");
        this.setOutput(true, null);
        this.setColour(330);
        this.setTooltip("変数の値を取得します");
    }
};

// リスト変数
Blockly.Blocks['create_list'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("リスト")
            .appendField(new Blockly.FieldTextInput("リスト名"), "LIST_NAME")
            .appendField("を作成");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("新しいリストを作成します");
    }
};

Blockly.Blocks['add_to_list'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("リスト")
            .appendField(new Blockly.FieldVariable("リスト名"), "LIST_NAME")
            .appendField("に追加:");
        this.appendValueInput("VALUE")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("リストに値を追加します");
    }
};
