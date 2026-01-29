// コード整形ユーティリティ
class CodeFormatter {
    static formatJavaScript(code) {
        // シンプルなフォーマッター
        let formatted = code;
        
        // インデントを整理
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const formattedLines = [];
        
        lines.forEach(line => {
            const trimmed = line.trim();
            
            if (trimmed.length === 0) {
                formattedLines.push('');
                return;
            }
            
            // 閉じ括弧のインデントを減らす
            if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // インデントを追加
            const indentedLine = '    '.repeat(indentLevel) + trimmed;
            formattedLines.push(indentedLine);
            
            // 開き括弧のインデントを増やす
            if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
                indentLevel++;
            }
        });
        
        return formattedLines.join('\n');
    }
    
    static formatPython(code) {
        // Python用のシンプルなフォーマッター
        let formatted = code;
        
        // タブを4スペースに変換
        formatted = formatted.replace(/\t/g, '    ');
        
        // 連続する空行を1行に
        formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        return formatted;
    }
    
    static formatTypeScript(code) {
        return this.formatJavaScript(code);
    }
    
    static format(code, language) {
        switch(language) {
            case 'javascript':
                return this.formatJavaScript(code);
            case 'python':
                return this.formatPython(code);
            case 'typescript':
                return this.formatTypeScript(code);
            default:
                return code;
        }
    }
    
    static minifyJavaScript(code) {
        // シンプルなミニファイヤー
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // 複数行コメントを削除
            .replace(/\/\/.*$/gm, '')        // 単一行コメントを削除
            .replace(/\s+/g, ' ')            // 連続する空白を1つに
            .replace(/\s*([{}()\[\];,=])\s*/g, '$1') // 括弧周りの空白を削除
            .trim();
    }
    
    static validateCode(code, language) {
        const errors = [];
        
        switch(language) {
            case 'javascript':
            case 'typescript':
                // 基本的な構文チェック
                if (!code.includes('client.login')) {
                    errors.push('Botのログイン処理が含まれていません');
                }
                if (!code.includes('require(\'discord.js\')') && 
                    !code.includes('from \'discord.js\'')) {
                    errors.push('discord.jsのインポートが含まれていません');
                }
                break;
                
            case 'python':
                if (!code.includes('bot.run')) {
                    errors.push('Botの実行処理が含まれていません');
                }
                if (!code.includes('import discord')) {
                    errors.push('discord.pyのインポートが含まれていません');
                }
                break;
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    static addComments(code, language) {
        let commented = code;
        
        switch(language) {
            case 'javascript':
            case 'typescript':
                commented = '// Discord Bot - 自動生成コード\n' +
                           '// このコードはDiscord Bot Builderで生成されました\n' +
                           '// 使い方: https://github.com/yourusername/discord-bot-builder\n\n' +
                           commented;
                break;
                
            case 'python':
                commented = '# Discord Bot - 自動生成コード\n' +
                           '# このコードはDiscord Bot Builderで生成されました\n' +
                           '# 使い方: https://github.com/yourusername/discord-bot-builder\n\n' +
                           commented;
                break;
        }
        
        return commented;
    }
    
    static generateReadme(code, language, botName = 'MyDiscordBot') {
        const now = new Date().toISOString().split('T')[0];
        
        return `# ${botName}

## 概要
このDiscord BotはDiscord Bot Builderによって生成されました。

生成日: ${now}
言語: ${language}

## セットアップ方法

### 1. 必要な環境
${this.getRequirements(language)}

### 2. インストール
\`\`\`bash
${this.getInstallCommands(language)}
\`\`\`

### 3. 設定
1. Discord Developer PortalでBotを作成
2. トークンを取得
3. コード内の \`YOUR_BOT_TOKEN_HERE\` を置き換え

### 4. 実行
\`\`\`bash
${this.getRunCommands(language)}
\`\`\`

## 生成されたコード
\`\`\`${language}
${code}
\`\`\`

## 注意事項
- トークンは他人と共有しないでください
- Botに必要な権限を適切に設定してください
- 大量のメッセージ送信はDiscordの利用規約に違反する場合があります

## サポート
質問や問題がある場合は、Discord Bot BuilderのGitHubリポジトリを参照してください。
`;
    }
    
    static getRequirements(language) {
        switch(language) {
            case 'javascript':
            case 'typescript':
                return '- Node.js 16.9.0以上\n- npm または yarn';
            case 'python':
                return '- Python 3.8以上\n- pip';
            default:
                return '';
        }
    }
    
    static getInstallCommands(language) {
        switch(language) {
            case 'javascript':
                return 'npm install discord.js';
            case 'typescript':
                return 'npm install discord.js typescript ts-node dotenv';
            case 'python':
                return 'pip install discord.py python-dotenv';
            default:
                return '';
        }
    }
    
    static getRunCommands(language) {
        switch(language) {
            case 'javascript':
                return 'node bot.js';
            case 'typescript':
                return 'ts-node bot.ts';
            case 'python':
                return 'python bot.py';
            default:
                return '';
        }
    }
}
