// ロジックブロック（標準ブロックの日本語化と拡張）
Blockly.Blocks['logic_compare'] = {
    init: function() {
        this.jsonInit({
            "message0": "%1 %2 %3",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A"
                },
                {
                    "type": "field_dropdown",
                    "name": "OP",
                    "options": [
                        ["=", "EQ"],
                        ["≠", "NEQ"],
                        ["＜", "LT"],
                        ["≤", "LTE"],
                        ["＞", "GT"],
                        ["≥", "GTE"]
                    ]
                },
                {
                    "type": "input_value",
                    "name": "B"
                }
            ],
            "inputsInline": true,
            "output": "Boolean",
            "colour": 210,
            "helpUrl": "%{BKY_LOGIC_COMPARE_HELPURL}"
        });
    }
};

Blockly.Blocks['logic_operation'] = {
    init: function() {
        this.jsonInit({
            "message0": "%1 %2 %3",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A",
                    "check": "Boolean"
                },
                {
                    "type": "field_dropdown",
                    "name": "OP",
                    "options": [
                        ["かつ", "AND"],
                        ["または", "OR"]
                    ]
                },
                {
                    "type": "input_value",
                    "name": "B",
                    "check": "Boolean"
                }
            ],
            "inputsInline": true,
            "output": "Boolean",
            "colour": 210,
            "helpUrl": "%{BKY_LOGIC_OPERATION_HELPURL}"
        });
    }
};

Blockly.Blocks['logic_negate'] = {
    init: function() {
        this.jsonInit({
            "message0": "%1 ではない",
            "args0": [
                {
                    "type": "input_value",
                    "name": "BOOL",
                    "check": "Boolean"
                }
            ],
            "output": "Boolean",
            "colour": 210,
            "helpUrl": "%{BKY_LOGIC_NEGATE_HELPURL}"
        });
    }
};

Blockly.Blocks['controls_if'] = {
    init: function() {
        this.jsonInit({
            "message0": "もし %1 なら",
            "args0": [
                {
                    "type": "input_value",
                    "name": "IF0",
                    "check": "Boolean"
                }
            ],
            "message1": "実行 %1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "DO0"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 210,
            "helpUrl": "%{BKY_CONTROLS_IF_HELPURL}"
        });
    }
};

Blockly.Blocks['controls_if_else'] = {
    init: function() {
        this.jsonInit({
            "message0": "もし %1 なら",
            "args0": [
                {
                    "type": "input_value",
                    "name": "IF0",
                    "check": "Boolean"
                }
            ],
            "message1": "実行 %1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "DO0"
                }
            ],
            "message2": "それ以外なら",
            "message3": "実行 %1",
            "args3": [
                {
                    "type": "input_statement",
                    "name": "ELSE"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 210,
            "helpUrl": "%{BKY_CONTROLS_IF_HELPURL}"
        });
    }
};

Blockly.Blocks['controls_repeat_ext'] = {
    init: function() {
        this.jsonInit({
            "message0": "%1 回繰り返す",
            "args0": [
                {
                    "type": "input_value",
                    "name": "TIMES",
                    "check": "Number"
                }
            ],
            "message1": "実行 %1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "DO"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 120,
            "helpUrl": "%{BKY_CONTROLS_REPEAT_HELPURL}"
        });
    }
};

Blockly.Blocks['controls_whileUntil'] = {
    init: function() {
        this.jsonInit({
            "message0": "%1 の間繰り返す %2",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "MODE",
                    "options": [
                        ["条件が真", "WHILE"],
                        ["条件が真になるまで", "UNTIL"]
                    ]
                },
                {
                    "type": "input_value",
                    "name": "BOOL",
                    "check": "Boolean"
                }
            ],
            "message1": "実行 %1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "DO"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 120,
            "helpUrl": "%{BKY_CONTROLS_WHILEUNTIL_HELPURL}"
        });
    }
};
