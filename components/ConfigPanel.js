class ConfigPanel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showAdvanced: false,
            autoSave: true,
            ...options
        };
        
        this.config = {
            bot: {
                token: '',
                prefix: '!',
                name: 'MyDiscordBot',
                status: 'online',
                activity: {
                    type: 'PLAYING',
                    text: 'Discord Bot Builder'
                }
            },
            permissions: {
                manageMessages: false,
                kickMembers: false,
                banMembers: false,
                manageChannels: false,
                manageRoles: false
            },
            features: {
                welcomeMessages: false,
                moderation: false,
                music: false,
                leveling: false,
                customCommands: false
            },
            advanced: {
                intents: ['Guilds', 'GuildMessages', 'MessageContent'],
                sharding: false,
                debug: false,
                logLevel: 'info'
            }
        };
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupEventListeners();
        this.loadFromLocalStorage();
    }
    
    createUI() {
        this.container.innerHTML = `
            <div class="config-panel">
                <div class="config-header">
                    <h3><i class="fas fa-cog"></i> Bot設定</h3>
                    <button class="btn-toggle" id="btn-toggle-advanced">
                        ${this.options.showAdvanced ? '基本設定' : '詳細設定'}
                    </button>
                </div>
                
                <div class="config-tabs">
                    <div class="tab-nav">
                        <button class="tab-btn active" data-tab="basic">基本</button>
                        <button class="tab-btn" data-tab="permissions">権限</button>
                        <button class="tab-btn" data-tab="features">機能</button>
                        ${this.options.showAdvanced ? 
                            '<button class="tab-btn" data-tab="advanced">詳細</button>' : ''}
                    </div>
                    
                    <div class="tab-content">
                        <!-- 基本設定 -->
                        <div id="tab-basic" class="tab-pane active">
                            ${this.createBasicConfigForm()}
                        </div>
                        
                        <!-- 権限設定 -->
                        <div id="tab-permissions" class="tab-pane">
                            ${this.createPermissionsForm()}
                        </div>
                        
                        <!-- 機能設定 -->
                        <div id="tab-features" class="tab-pane">
                            ${this.createFeaturesForm()}
                        </div>
                        
                        <!-- 詳細設定 -->
                        ${this.options.showAdvanced ? `
                        <div id="tab-advanced" class="tab-pane">
                            ${this.createAdvancedForm()}
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="config-actions">
                    <button class="btn-secondary" id="btn-reset-config">リセット</button>
                    <button class="btn-primary" id="btn-save-config">設定を保存</button>
                </div>
            </div>
        `;
    }
    
    createBasicConfigForm() {
        return `
            <div class="form-group">
                <label for="bot-name">
                    <i class="fas fa-robot"></i> Bot名
                </label>
                <input type="text" id="bot-name" value="${this.config.bot.name}" 
                       placeholder="MyDiscordBot">
            </div>
            
            <div class="form-group">
                <label for="bot-prefix">
                    <i class="fas fa-hashtag"></i> コマンドプレフィックス
                </label>
                <input type="text" id="bot-prefix" value="${this.config.bot.prefix}" 
                       placeholder="!" maxlength="3">
            </div>
            
            <div class="form-group">
                <label for="bot-status">
                    <i class="fas fa-circle"></i> ステータス
                </label>
                <select id="bot-status">
                    <option value="online" ${this.config.bot.status === 'online' ? 'selected' : ''}>オンライン</option>
                    <option value="idle" ${this.config.bot.status === 'idle' ? 'selected' : ''}>退席中</option>
                    <option value="dnd" ${this.config.bot.status === 'dnd' ? 'selected' : ''}>取り込み中</option>
                    <option value="invisible" ${this.config.bot.status === 'invisible' ? 'selected' : ''}>非表示</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="activity-type">
                    <i class="fas fa-gamepad"></i> アクティビティタイプ
                </label>
                <select id="activity-type">
                    <option value="PLAYING" ${this.config.bot.activity.type === 'PLAYING' ? 'selected' : ''}>プレイ中</option>
                    <option value="LISTENING" ${this.config.bot.activity.type === 'LISTENING' ? 'selected' : ''}>聴取中</option>
                    <option value="WATCHING" ${this.config.bot.activity.type === 'WATCHING' ? 'selected' : ''}>視聴中</option>
                    <option value="COMPETING" ${this.config.bot.activity.type === 'COMPETING' ? 'selected' : ''}>参加中</option>
                    <option value="STREAMING" ${this.config.bot.activity.type === 'STREAMING' ? 'selected' : ''}>配信中</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="activity-text">
                    <i class="fas fa-comment"></i> アクティビティテキスト
                </label>
                <input type="text" id="activity-text" value="${this.config.bot.activity.text}" 
                       placeholder="Discord Bot Builder">
            </div>
            
            <div class="form-group">
                <label>
                    <i class="fas fa-key"></i> Botトークン
                </label>
                <div class="token-input">
                    <input type="password" id="bot-token" value="${this.config.bot.token}" 
                           placeholder="Botトークンを入力（任意）">
                    <button type="button" class="btn-icon" id="btn-toggle-token">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <small class="help-text">
                    トークンはコード生成時には含まれません。自分で設定してください。
                </small>
            </div>
        `;
    }
    
    createPermissionsForm() {
        return `
            <div class="permissions-list">
                ${Object.entries(this.config.permissions).map(([key, value]) => `
                    <div class="permission-item">
                        <label class="checkbox-label">
                            <input type="checkbox" id="perm-${key}" ${value ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            ${this.getPermissionLabel(key)}
                        </label>
                        <small class="permission-desc">
                            ${this.getPermissionDescription(key)}
                        </small>
                    </div>
                `).join('')}
            </div>
            
            <div class="permissions-info">
                <p><i class="fas fa-info-circle"></i> 必要な権限だけを有効にしてください。</p>
                <p>権限はBot招待URL生成時に使用されます。</p>
            </div>
        `;
    }
    
    createFeaturesForm() {
        return `
            <div class="features-list">
                ${Object.entries(this.config.features).map(([key, value]) => `
                    <div class="feature-item">
                        <label class="checkbox-label">
                            <input type="checkbox" id="feature-${key}" ${value ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            ${this.getFeatureLabel(key)}
                        </label>
                        <small class="feature-desc">
                            ${this.getFeatureDescription(key)}
                        </small>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    createAdvancedForm() {
        return `
            <div class="form-group">
                <label for="intents">
                    <i class="fas fa-bolt"></i> インテント
                </label>
                <div class="intents-list">
                    ${this.getAvailableIntents().map(intent => `
                        <label class="checkbox-label">
                            <input type="checkbox" value="${intent.value}" 
                                   ${this.config.advanced.intents.includes(intent.value) ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            ${intent.label}
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="sharding" ${this.config.advanced.sharding ? 'checked' : ''}>
                    <span class="checkmark"></span>
                    シャーディングを有効にする（大規模サーバー向け）
                </label>
            </div>
            
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="debug" ${this.config.advanced.debug ? 'checked' : ''}>
                    <span class="checkmark"></span>
                    デバッグモードを有効にする
                </label>
            </div>
            
            <div class="form-group">
                <label for="log-level">
                    <i class="fas fa-file-alt"></i> ログレベル
                </label>
                <select id="log-level">
                    <option value="error" ${this.config.advanced.logLevel === 'error' ? 'selected' : ''}>エラーのみ</option>
                    <option value="warn" ${this.config.advanced.logLevel === 'warn' ? 'selected' : ''}>警告以上</option>
                    <option value="info" ${this.config.advanced.logLevel === 'info' ? 'selected' : ''}>情報以上</option>
                    <option value="debug" ${this.config.advanced.logLevel === 'debug' ? 'selected' : ''}>デバッグ</option>
                </select>
            </div>
        `;
    }
    
    getPermissionLabel(key) {
        const labels = {
            manageMessages: 'メッセージの管理',
            kickMembers: 'メンバーのキック',
            banMembers: 'メンバーのBAN',
            manageChannels: 'チャンネルの管理',
            manageRoles: 'ロールの管理'
        };
        return labels[key] || key;
    }
    
    getPermissionDescription(key) {
        const descriptions = {
            manageMessages: 'メッセージの削除やピン留めができます',
            kickMembers: 'サーバーからメンバーを追放できます',
            banMembers: 'サーバーからメンバーをBANできます',
            manageChannels: 'チャンネルの作成、編集、削除ができます',
            manageRoles: 'ロールの作成、編集、削除ができます'
        };
        return descriptions[key] || '';
    }
    
    getFeatureLabel(key) {
        const labels = {
            welcomeMessages: 'ウェルカムメッセージ',
            moderation: 'モデレーション機能',
            music: '音楽再生機能',
            leveling: 'レベルシステム',
            customCommands: 'カスタムコマンド'
        };
        return labels[key] || key;
    }
    
    getFeatureDescription(key) {
        const descriptions = {
            welcomeMessages: '新規メンバーを自動で歓迎します',
            moderation: 'スパム対策やメッセージ管理を行います',
            music: 'ボイスチャンネルで音楽を再生します',
            leveling: 'チャット経験値システムを追加します',
            customCommands: 'カスタムコマンドを作成できます'
        };
        return descriptions[key] || '';
    }
    
    getAvailableIntents() {
        return [
            { value: 'Guilds', label: 'サーバー情報' },
            { value: 'GuildMembers', label: 'サーバーメンバー' },
            { value: 'GuildMessages', label: 'サーバーメッセージ' },
            { value: 'MessageContent', label: 'メッセージ内容' },
            { value: 'GuildVoiceStates', label: 'ボイス状態' },
            { value: 'GuildPresences', label: 'プレゼンス情報' }
        ];
    }
    
    setupEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // 詳細設定切り替え
        document.getElementById('btn-toggle-advanced').addEventListener('click', () => {
            this.options.showAdvanced = !this.options.showAdvanced;
            this.createUI();
            this.setupEventListeners();
        });
        
        // トークン表示切り替え
        document.getElementById('btn-toggle-token')?.addEventListener('click', (e) => {
            const tokenInput = document.getElementById('bot-token');
            const icon = e.target.closest('button').querySelector('i');
            
            if (tokenInput.type === 'password') {
                tokenInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                tokenInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
        
        // 設定保存
        document.getElementById('btn-save-config').addEventListener('click', () => {
            this.saveConfig();
        });
        
        // 設定リセット
        document.getElementById('btn-reset-config').addEventListener('click', () => {
            if (confirm('設定をデフォルトに戻しますか？')) {
                this.resetConfig();
            }
        });
        
        // 自動保存設定
        if (this.options.autoSave) {
            this.container.addEventListener('change', () => {
                this.saveToLocalStorage();
            });
        }
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
    
    saveConfig() {
        this.updateConfigFromUI();
        
        // 設定変更イベントを発火
        const event = new CustomEvent('configChange', {
            detail: { config: this.config }
        });
        document.dispatchEvent(event);
        
        this.showToast('設定を保存しました', 'success');
    }
    
    updateConfigFromUI() {
        // 基本設定
        this.config.bot.name = document.getElementById('bot-name').value;
        this.config.bot.prefix = document.getElementById('bot-prefix').value;
        this.config.bot.status = document.getElementById('bot-status').value;
        this.config.bot.activity.type = document.getElementById('activity-type').value;
        this.config.bot.activity.text = document.getElementById('activity-text').value;
        this.config.bot.token = document.getElementById('bot-token').value;
        
        // 権限設定
        Object.keys(this.config.permissions).forEach(key => {
            const checkbox = document.getElementById(`perm-${key}`);
            if (checkbox) {
                this.config.permissions[key] = checkbox.checked;
            }
        });
        
        // 機能設定
        Object.keys(this.config.features).forEach(key => {
            const checkbox = document.getElementById(`feature-${key}`);
            if (checkbox) {
                this.config.features[key] = checkbox.checked;
            }
        });
        
        // 詳細設定
        if (this.options.showAdvanced) {
            // インテント
            const intentCheckboxes = document.querySelectorAll('.intents-list input[type="checkbox"]');
            this.config.advanced.intents = Array.from(intentCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            
            this.config.advanced.sharding = document.getElementById('sharding').checked;
            this.config.advanced.debug = document.getElementById('debug').checked;
            this.config.advanced.logLevel = document.getElementById('log-level').value;
        }
    }
    
    resetConfig() {
        this.config = {
            bot: {
                token: '',
                prefix: '!',
                name: 'MyDiscordBot',
                status: 'online',
                activity: {
                    type: 'PLAYING',
                    text: 'Discord Bot Builder'
                }
            },
            permissions: {
                manageMessages: false,
                kickMembers: false,
                banMembers: false,
                manageChannels: false,
                manageRoles: false
            },
            features: {
                welcomeMessages: false,
                moderation: false,
                music: false,
                leveling: false,
                customCommands: false
            },
            advanced: {
                intents: ['Guilds', 'GuildMessages', 'MessageContent'],
                sharding: false,
                debug: false,
                logLevel: 'info'
            }
        };
        
        this.createUI();
        this.setupEventListeners();
        this.saveToLocalStorage();
        
        this.showToast('設定をリセットしました', 'info');
    }
    
    saveToLocalStorage() {
        this.updateConfigFromUI();
        localStorage.setItem('discord-bot-config', JSON.stringify(this.config));
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('discord-bot-config');
        if (saved) {
            try {
                this.config = JSON.parse(saved);
                this.createUI();
                this.setupEventListeners();
            } catch (e) {
                console.error('設定の読み込みに失敗しました:', e);
            }
        }
    }
    
    getConfig() {
        this.updateConfigFromUI();
        return this.config;
    }
    
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.createUI();
        this.setupEventListeners();
    }
    
    generateInviteUrl() {
        const permissions = this.calculatePermissions();
        const clientId = this.extractClientId(this.config.bot.token);
        
        if (!clientId) {
            return null;
        }
        
        const baseUrl = 'https://discord.com/oauth2/authorize';
        const params = new URLSearchParams({
            client_id: clientId,
            permissions: permissions,
            scope: 'bot applications.commands'
        });
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    calculatePermissions() {
        // パーミッション計算ロジック
        const permissionValues = {
            manageMessages: 0x00002000,
            kickMembers: 0x00000002,
            banMembers: 0x00000004,
            manageChannels: 0x00000010,
            manageRoles: 0x10000000
        };
        
        let permissions = 0;
        Object.entries(this.config.permissions).forEach(([key, enabled]) => {
            if (enabled && permissionValues[key]) {
                permissions |= permissionValues[key];
            }
        });
        
        return permissions.toString();
    }
    
    extractClientId(token) {
        if (!token) return null;
        
        try {
            // Discordトークンからclient_idを抽出（Base64デコード）
            const parts = token.split('.');
            if (parts.length >= 1) {
                return parts[0];
            }
        } catch (e) {
            console.error('Client IDの抽出に失敗しました:', e);
        }
        
        return null;
    }
    
    showToast(message, type = 'info') {
        // シンプルなトースト通知
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: ${type === 'success' ? '#57F287' : type === 'error' ? '#ED4245' : '#5865F2'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}
