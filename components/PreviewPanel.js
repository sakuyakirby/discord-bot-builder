class PreviewPanel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showChat: true,
            showEvents: true,
            showVariables: true,
            ...options
        };
        
        this.chatMessages = [];
        this.events = [];
        this.variables = new Map();
        this.isSimulating = false;
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupEventListeners();
        this.addSampleData();
    }
    
    createUI() {
        this.container.innerHTML = `
            <div class="preview-panel">
                <div class="preview-header">
                    <h3><i class="fas fa-eye"></i> プレビュー</h3>
                    <div class="preview-controls">
                        <button class="btn-icon" id="btn-clear-preview" title="クリア">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-icon" id="btn-refresh-preview" title="更新">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn-toggle" id="btn-toggle-simulation">
                            <i class="fas fa-play"></i> シミュレーション開始
                        </button>
                    </div>
                </div>
                
                <div class="preview-tabs">
                    <div class="tab-nav">
                        <button class="tab-btn active" data-tab="chat">チャット</button>
                        <button class="tab-btn" data-tab="events">イベント</button>
                        <button class="tab-btn" data-tab="variables">変数</button>
                        <button class="tab-btn" data-tab="console">コンソール</button>
                    </div>
                    
                    <div class="tab-content">
                        <!-- チャットプレビュー -->
                        <div id="tab-chat" class="tab-pane active">
                            <div class="chat-preview">
                                <div class="chat-messages" id="chat-messages">
                                    <!-- メッセージがここに表示されます -->
                                </div>
                                <div class="chat-input">
                                    <input type="text" id="chat-input" placeholder="メッセージを入力...">
                                    <button id="btn-send-message">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                    <button id="btn-simulate-event" class="btn-secondary">
                                        <i class="fas fa-bolt"></i> イベントをシミュレート
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- イベントログ -->
                        <div id="tab-events" class="tab-pane">
                            <div class="events-log">
                                <div class="events-list" id="events-list">
                                    <!-- イベントがここに表示されます -->
                                </div>
                                <div class="events-controls">
                                    <button class="btn-secondary" id="btn-clear-events">
                                        <i class="fas fa-trash"></i> ログをクリア
                                    </button>
                                    <button class="btn-secondary" id="btn-simulate-random">
                                        <i class="fas fa-random"></i> ランダムイベント
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 変数モニター -->
                        <div id="tab-variables" class="tab-pane">
                            <div class="variables-monitor">
                                <table class="variables-table">
                                    <thead>
                                        <tr>
                                            <th>変数名</th>
                                            <th>値</th>
                                            <th>型</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="variables-body">
                                        <!-- 変数がここに表示されます -->
                                    </tbody>
                                </table>
                                <div class="variable-controls">
                                    <button class="btn-secondary" id="btn-add-variable">
                                        <i class="fas fa-plus"></i> 変数を追加
                                    </button>
                                    <button class="btn-secondary" id="btn-clear-variables">
                                        <i class="fas fa-trash"></i> 変数をクリア
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- コンソール -->
                        <div id="tab-console" class="tab-pane">
                            <div class="console-output">
                                <div class="console-log" id="console-log">
                                    <!-- コンソール出力がここに表示されます -->
                                </div>
                                <div class="console-input">
                                    <input type="text" id="console-input" placeholder="コマンドを入力...">
                                    <button id="btn-execute-command">
                                        <i class="fas fa-terminal"></i> 実行
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.updateChatMessages();
        this.updateEventsList();
        this.updateVariablesTable();
        this.updateConsoleLog();
    }
    
    setupEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // チャットメッセージ送信
        document.getElementById('btn-send-message').addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // イベントシミュレーション
        document.getElementById('btn-simulate-event').addEventListener('click', () => {
            this.showEventSimulationMenu();
        });
        
        // シミュレーショントグル
        document.getElementById('btn-toggle-simulation').addEventListener('click', () => {
            this.toggleSimulation();
        });
        
        // プレビュークリア
        document.getElementById('btn-clear-preview').addEventListener('click', () => {
            this.clearPreview();
        });
        
        // プレビュー更新
        document.getElementById('btn-refresh-preview').addEventListener('click', () => {
            this.refreshPreview();
        });
        
        // イベントログクリア
        document.getElementById('btn-clear-events').addEventListener('click', () => {
            this.clearEvents();
        });
        
        // ランダムイベント
        document.getElementById('btn-simulate-random').addEventListener('click', () => {
            this.simulateRandomEvent();
        });
        
        // 変数追加
        document.getElementById('btn-add-variable').addEventListener('click', () => {
            this.addVariable();
        });
        
        // 変数クリア
        document.getElementById('btn-clear-variables').addEventListener('click', () => {
            this.clearVariables();
        });
        
        // コンソールコマンド実行
        document.getElementById('btn-execute-command').addEventListener('click', () => {
            this.executeConsoleCommand();
        });
        
        document.getElementById('console-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeConsoleCommand();
            }
        });
        
        // ワークスペース変更イベントを監視
        document.addEventListener('blocklyChange', () => {
            this.updateFromWorkspace();
        });
    }
    
    switchTab(tabId) {
        // タブボタンのアクティブ状態を更新
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        
        // タブコンテンツの表示を更新
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`tab-${tabId}`).classList.add('active');
    }
    
    addSampleData() {
        // サンプルデータを追加
        this.addChatMessage('user', 'ユーザーA', 'こんにちは！');
        this.addChatMessage('bot', 'Bot', 'こんにちは！Discord Bot Builderへようこそ！');
        this.addChatMessage('user', 'ユーザーB', '!ping');
        this.addChatMessage('bot', 'Bot', '🏓 Pong!');
        
        this.addEvent('messageCreate', 'ユーザーA: こんにちは！');
        this.addEvent('messageCreate', 'ユーザーB: !ping');
        this.addEvent('command', 'pingコマンドを実行');
        
        this.setVariable('counter', 1);
        this.setVariable('lastUser', 'ユーザーA');
        this.setVariable('isActive', true);
        
        this.addConsoleLog('info', 'Botプレビューを開始しました');
        this.addConsoleLog('info', '3件のメッセージをシミュレーション');
    }
    
    addChatMessage(type, author, content) {
        const message = {
            id: Date.now(),
            type, // 'user', 'bot', 'system'
            author,
            content,
            timestamp: new Date().toLocaleTimeString(),
            avatar: this.getAvatar(type, author)
        };
        
        this.chatMessages.push(message);
        
        // 最大50件まで保持
        if (this.chatMessages.length > 50) {
            this.chatMessages.shift();
        }
        
        this.updateChatMessages();
        
        // 自動スクロール
        setTimeout(() => {
            const messagesContainer = document.getElementById('chat-messages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);
    }
    
    getAvatar(type, author) {
        // シンプルなアバター生成
        const colors = {
            user: '#5865F2',
            bot: '#57F287',
            system: '#ED4245'
        };
        
        const color = colors[type] || '#99aab5';
        const initials = author.charAt(0).toUpperCase();
        
        return `<div class="avatar" style="background-color: ${color}">${initials}</div>`;
    }
    
    updateChatMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        container.innerHTML = this.chatMessages.map(msg => `
            <div class="chat-message chat-message-${msg.type}">
                <div class="message-avatar">${msg.avatar}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${msg.author}</span>
                        <span class="message-time">${msg.timestamp}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(msg.content)}</div>
                </div>
            </div>
        `).join('');
    }
    
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // ユーザーメッセージを追加
        this.addChatMessage('user', 'あなた', message);
        
        // Botの応答をシミュレート
        this.simulateBotResponse(message);
        
        // イベントを記録
        this.addEvent('messageCreate', `あなた: ${message}`);
        
        // 入力欄をクリア
        input.value = '';
        input.focus();
    }
    
    simulateBotResponse(message) {
        // 簡単な応答ロジック
        let response = '';
        
        if (message.includes('こんにちは') || message.includes('hello')) {
            response = 'こんにちは！Botは正常に動作しています。';
        } else if (message.includes('!ping')) {
            response = '🏓 Pong!';
        } else if (message.includes('!help')) {
            response = '利用可能なコマンド: !ping, !hello, !help';
        } else if (message.includes('天気')) {
            response = '今日の天気は晴れです！';
        } else {
            response = `「${message}」というメッセージを受信しました。`;
        }
        
        // 少し遅延を入れて自然な感じに
        setTimeout(() => {
            this.addChatMessage('bot', 'Bot', response);
            this.addEvent('botResponse', `Bot: ${response}`);
            
            // 変数を更新
            const counter = this.variables.get('counter') || 0;
            this.setVariable('counter', counter + 1);
            this.setVariable('lastMessage', message);
        }, 500 + Math.random() * 500);
    }
    
    showEventSimulationMenu() {
        const menu = document.createElement('div');
        menu.className = 'event-menu';
        menu.innerHTML = `
            <div class="event-menu-content">
                <h4>イベントをシミュレート</h4>
                <div class="event-options">
                    <button class="event-option" data-event="messageCreate">
                        <i class="fas fa-comment"></i> メッセージ作成
                    </button>
                    <button class="event-option" data-event="guildMemberAdd">
                        <i class="fas fa-user-plus"></i> メンバー参加
                    </button>
                    <button class="event-option" data-event="messageReactionAdd">
                        <i class="fas fa-thumbs-up"></i> リアクション追加
                    </button>
                    <button class="event-option" data-event="messageDelete">
                        <i class="fas fa-trash"></i> メッセージ削除
                    </button>
                    <button class="event-option" data-event="ready">
                        <i class="fas fa-play"></i> Bot起動
                    </button>
                </div>
                <button class="btn-secondary btn-close-menu">キャンセル</button>
            </div>
        `;
        
        menu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        document.body.appendChild(menu);
        
        // イベント選択
        menu.querySelectorAll('.event-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const eventType = e.target.closest('button').dataset.event;
                this.simulateEvent(eventType);
                document.body.removeChild(menu);
            });
        });
        
        // キャンセル
        menu.querySelector('.btn-close-menu').addEventListener('click', () => {
            document.body.removeChild(menu);
        });
        
        // 背景クリックで閉じる
        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                document.body.removeChild(menu);
            }
        });
    }
    
    simulateEvent(eventType) {
        const events = {
            'messageCreate': {
                description: 'メッセージが作成されました',
                data: { author: 'テストユーザー', content: 'テストメッセージ' }
            },
            'guildMemberAdd': {
                description: '新しいメンバーが参加しました',
                data: { member: 'NewUser#1234' }
            },
            'messageReactionAdd': {
                description: 'リアクションが追加されました',
                data: { emoji: '👍', user: 'UserA' }
            },
            'messageDelete': {
                description: 'メッセージが削除されました',
                data: { messageId: '123456789' }
            },
            'ready': {
                description: 'Botが起動しました',
                data: { user: 'MyBot#1234' }
            }
        };
        
        const event = events[eventType];
        if (event) {
            this.addEvent(eventType, event.description);
            this.addConsoleLog('info', `${eventType}イベントをシミュレート: ${JSON.stringify(event.data)}`);
            
            // チャットにも反映
            if (eventType === 'messageCreate') {
                this.addChatMessage('user', event.data.author, event.data.content);
            } else if (eventType === 'guildMemberAdd') {
                this.addChatMessage('system', 'システム', `${event.data.member} がサーバーに参加しました`);
            }
        }
    }
    
    simulateRandomEvent() {
        const events = ['messageCreate', 'guildMemberAdd', 'messageReactionAdd', 'messageDelete'];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        this.simulateEvent(randomEvent);
    }
    
    toggleSimulation() {
        this.isSimulating = !this.isSimulating;
        const button = document.getElementById('btn-toggle-simulation');
        
        if (this.isSimulating) {
            button.innerHTML = '<i class="fas fa-pause"></i> シミュレーション停止';
            button.classList.add('active');
            this.startSimulation();
        } else {
            button.innerHTML = '<i class="fas fa-play"></i> シミュレーション開始';
            button.classList.remove('active');
            this.stopSimulation();
        }
    }
    
    startSimulation() {
        this.simulationInterval = setInterval(() => {
            if (Math.random() > 0.7) { // 30%の確率でイベント発生
                this.simulateRandomEvent();
            }
        }, 3000);
        
        this.addConsoleLog('info', 'シミュレーションを開始しました');
    }
    
    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        this.addConsoleLog('info', 'シミュレーションを停止しました');
    }
    
    addEvent(type, description) {
        const event = {
            id: Date.now(),
            type,
            description,
            timestamp: new Date().toLocaleTimeString(),
            icon: this.getEventIcon(type)
        };
        
        this.events.push(event);
        
        // 最大100件まで保持
        if (this.events.length > 100) {
            this.events.shift();
        }
        
        this.updateEventsList();
    }
    
    getEventIcon(type) {
        const icons = {
            'messageCreate': 'fa-comment',
            'guildMemberAdd': 'fa-user-plus',
            'messageReactionAdd': 'fa-thumbs-up',
            'messageDelete': 'fa-trash',
            'messageUpdate': 'fa-edit',
            'ready': 'fa-play',
            'command': 'fa-terminal',
            'botResponse': 'fa-robot',
            'error': 'fa-exclamation-triangle',
            'warning': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        };
        
        return icons[type] || 'fa-circle';
    }
    
    updateEventsList() {
        const container = document.getElementById('events-list');
        if (!container) return;
        
        container.innerHTML = this.events.map(event => `
            <div class="event-item event-${event.type}">
                <div class="event-icon">
                    <i class="fas ${event.icon}"></i>
                </div>
                <div class="event-content">
                    <div class="event-description">${event.description}</div>
                    <div class="event-meta">
                        <span class="event-type">${event.type}</span>
                        <span class="event-time">${event.timestamp}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    setVariable(name, value) {
        this.variables.set(name, value);
        this.updateVariablesTable();
    }
    
    updateVariablesTable() {
        const tbody = document.getElementById('variables-body');
        if (!tbody) return;
        
        const rows = Array.from(this.variables.entries()).map(([name, value]) => {
            const type = typeof value;
            const displayValue = type === 'object' ? JSON.stringify(value) : String(value);
            
            return `
                <tr>
                    <td><code>${name}</code></td>
                    <td><code>${this.escapeHtml(displayValue)}</code></td>
                    <td><span class="type-tag type-${type}">${type}</span></td>
                    <td>
                        <button class="btn-icon btn-edit-var" data-var="${name}" title="編集">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete-var" data-var="${name}" title="削除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = rows || '<tr><td colspan="4">変数がありません</td></tr>';
        
        // イベントリスナーを設定
        tbody.querySelectorAll('.btn-edit-var').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const varName = e.target.closest('button').dataset.var;
                this.editVariable(varName);
            });
        });
        
        tbody.querySelectorAll('.btn-delete-var').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const varName = e.target.closest('button').dataset.var;
                this.deleteVariable(varName);
            });
        });
    }
    
    addVariable() {
        const name = prompt('変数名を入力してください:');
        if (!name) return;
        
        const value = prompt('変数の値を入力してください:', '');
        if (value === null) return;
        
        // 値の型を推測
        let typedValue = value;
        if (value === 'true') typedValue = true;
        else if (value === 'false') typedValue = false;
        else if (value === 'null') typedValue = null;
        else if (value === 'undefined') typedValue = undefined;
        else if (!isNaN(value) && value.trim() !== '') typedValue = Number(value);
        
        this.setVariable(name, typedValue);
        this.addConsoleLog('info', `変数を追加: ${name} = ${typedValue}`);
    }
    
    editVariable(name) {
        const currentValue = this.variables.get(name);
        const newValue = prompt(`${name}の新しい値を入力してください:`, currentValue);
        
        if (newValue !== null) {
            this.setVariable(name, newValue);
            this.addConsoleLog('info', `変数を更新: ${name} = ${newValue}`);
        }
    }
    
    deleteVariable(name) {
        if (confirm(`変数「${name}」を削除しますか？`)) {
            this.variables.delete(name);
            this.updateVariablesTable();
            this.addConsoleLog('info', `変数を削除: ${name}`);
        }
    }
    
    addConsoleLog(level, message) {
        const log = {
            id: Date.now(),
            level, // 'info', 'warn', 'error', 'debug'
            message,
            timestamp: new Date().toLocaleTimeString()
        };
        
        // 簡易実装（実際には配列に保存して表示）
        const container = document.getElementById('console-log');
        if (container) {
            const logElement = document.createElement('div');
            logElement.className = `console-item console-${level}`;
            logElement.innerHTML = `
                <span class="console-time">[${log.timestamp}]</span>
                <span class="console-level">${level.toUpperCase()}</span>
                <span class="console-message">${this.escapeHtml(message)}</span>
            `;
            
            container.appendChild(logElement);
            
            // 自動スクロール
            container.scrollTop = container.scrollHeight;
        }
    }
    
    updateConsoleLog() {
        // 初期メッセージを表示
        const container = document.getElementById('console-log');
        if (container) {
            container.innerHTML = `
                <div class="console-item console-info">
                    <span class="console-time">[${new Date().toLocaleTimeString()}]</span>
                    <span class="console-level">INFO</span>
                    <span class="console-message">コンソールが初期化されました</span>
                </div>
            `;
        }
    }
    
    executeConsoleCommand() {
        const input = document.getElementById('console-input');
        const command = input.value.trim();
        
        if (!command) return;
        
        // コマンドをログに追加
        this.addConsoleLog('input', `> ${command}`);
        
        // コマンドを処理
        this.processConsoleCommand(command);
        
        // 入力欄をクリア
        input.value = '';
        input.focus();
    }
    
    processConsoleCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        switch(cmd) {
            case 'help':
                this.addConsoleLog('info', '利用可能なコマンド:');
                this.addConsoleLog('info', '  help - このメッセージを表示');
                this.addConsoleLog('info', '  clear - コンソールをクリア');
                this.addConsoleLog('info', '  vars - 変数を一覧表示');
                this.addConsoleLog('info', '  set <name> <value> - 変数を設定');
                this.addConsoleLog('info', '  event <type> - イベントを発生');
                this.addConsoleLog('info', '  simulate <on|off> - シミュレーション制御');
                break;
                
            case 'clear':
                const container = document.getElementById('console-log');
                if (container) {
                    container.innerHTML = '';
                    this.addConsoleLog('info', 'コンソールをクリアしました');
                }
                break;
                
            case 'vars':
                this.addConsoleLog('info', '変数一覧:');
                this.variables.forEach((value, name) => {
                    this.addConsoleLog('info', `  ${name} = ${value} (${typeof value})`);
                });
                break;
                
            case 'set':
                if (args.length >= 2) {
                    this.setVariable(args[0], args.slice(1).join(' '));
                    this.addConsoleLog('info', `変数を設定: ${args[0]} = ${args.slice(1).join(' ')}`);
                } else {
                    this.addConsoleLog('error', '使用方法: set <name> <value>');
                }
                break;
                
            case 'event':
                if (args.length >= 1) {
                    this.simulateEvent(args[0]);
                } else {
                    this.addConsoleLog('error', '使用方法: event <type>');
                }
                break;
                
            case 'simulate':
                if (args[0] === 'on') {
                    this.isSimulating = true;
                    this.startSimulation();
                } else if (args[0] === 'off') {
                    this.isSimulating = false;
                    this.stopSimulation();
                } else {
                    this.addConsoleLog('error', '使用方法: simulate <on|off>');
                }
                break;
                
            default:
                this.addConsoleLog('error', `不明なコマンド: ${cmd}`);
                this.addConsoleLog('info', '「help」と入力して利用可能なコマンドを確認してください');
        }
    }
    
    clearPreview() {
        if (confirm('プレビューをすべてクリアしますか？')) {
            this.chatMessages = [];
            this.events = [];
            this.variables.clear();
            
            this.updateChatMessages();
            this.updateEventsList();
            this.updateVariablesTable();
            this.updateConsoleLog();
            
            this.addConsoleLog('info', 'プレビューをクリアしました');
            this.addChatMessage('system', 'システム', 'プレビューがクリアされました');
        }
    }
    
    refreshPreview() {
        this.updateChatMessages();
        this.updateEventsList();
        this.updateVariablesTable();
        this.updateConsoleLog();
        
        this.addConsoleLog('info', 'プレビューを更新しました');
    }
    
    clearEvents() {
        this.events = [];
        this.updateEventsList();
        this.addConsoleLog('info', 'イベントログをクリアしました');
    }
    
    clearVariables() {
        if (confirm('すべての変数をクリアしますか？')) {
            this.variables.clear();
            this.updateVariablesTable();
            this.addConsoleLog('info', '変数をクリアしました');
        }
    }
    
    updateFromWorkspace() {
        // ワークスペースから変数などを更新
        // ここでは簡易実装
        this.addConsoleLog('debug', 'ワークスペースが更新されました');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
