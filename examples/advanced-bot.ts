// 高度なDiscord Bot - TypeScript版
// このコードはDiscord Bot Builderで生成されました

import { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    Message, 
    GuildMember,
    TextChannel,
    ActivityType
} from 'discord.js';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

// 環境変数の読み込み
dotenv.config();

// ロガーの設定
const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'bot.log' })
    ]
});

// Bot設定のインターフェース
interface BotConfig {
    prefix: string;
    welcomeChannel?: string;
    adminRole?: string;
    allowedChannels?: string[];
}

// ユーザーデータのインターフェース
interface UserData {
    messageCount: number;
    lastActive: Date;
    level: number;
    xp: number;
}

// クラス定義
class AdvancedDiscordBot {
    private client: Client;
    private config: BotConfig;
    private userData: Map<string, UserData>;
    private cooldowns: Map<string, Map<string, number>>;

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions
            ]
        });

        this.config = {
            prefix: process.env.BOT_PREFIX || '!',
            welcomeChannel: process.env.WELCOME_CHANNEL,
            adminRole: process.env.ADMIN_ROLE || 'Admin',
            allowedChannels: process.env.ALLOWED_CHANNELS?.split(',')
        };

        this.userData = new Map();
        this.cooldowns = new Map();

        this.initialize();
    }

    private initialize(): void {
        this.setupEventHandlers();
        this.setupCommands();
    }

    private setupEventHandlers(): void {
        // 起動イベント
        this.client.on('ready', () => this.onReady());

        // メッセージイベント
        this.client.on('messageCreate', (message) => this.onMessageCreate(message));

        // メンバー参加イベント
        this.client.on('guildMemberAdd', (member) => this.onGuildMemberAdd(member));

        // メンバー退出イベント
        this.client.on('guildMemberRemove', (member) => this.onGuildMemberRemove(member));

        // エラーイベント
        this.client.on('error', (error) => this.onError(error));

        // 警告イベント
        this.client.on('warn', (warning) => this.onWarn(warning));
    }

    private setupCommands(): void {
        // コマンドは個別のハンドラーで処理
    }

    private async onReady(): Promise<void> {
        if (!this.client.user) return;

        logger.info(`✅ Botが起動しました: ${this.client.user.tag}`);
        logger.info(`📊 サーバー数: ${this.client.guilds.cache.size}`);

        // アクティビティを設定
        this.client.user.setActivity({
            name: `${this.config.prefix}help | TypeScript Bot`,
            type: ActivityType.Playing
        });

        // ステータスを設定
        this.client.user.setStatus('online');
    }

    private async onMessageCreate(message: Message): Promise<void> {
        // Bot自身のメッセージは無視
        if (message.author.bot) return;

        // チャンネル制限チェック
        if (this.config.allowedChannels && 
            this.config.allowedChannels.length > 0 &&
            !this.config.allowedChannels.includes(message.channel.id)) {
            return;
        }

        // ユーザーデータの更新
        this.updateUserData(message.author.id);

        // コマンド処理
        if (message.content.startsWith(this.config.prefix)) {
            await this.handleCommand(message);
        } else {
            // 通常のメッセージ処理
            await this.handleRegularMessage(message);
        }
    }

    private updateUserData(userId: string): void {
        const now = new Date();
        const user = this.userData.get(userId) || {
            messageCount: 0,
            lastActive: now,
            level: 1,
            xp: 0
        };

        user.messageCount++;
        user.lastActive = now;
        
        // XPの追加
        user.xp += 10;

        // レベルアップチェック
        const xpForNextLevel = user.level * 100;
        if (user.xp >= xpForNextLevel) {
            user.level++;
            user.xp = 0;
            logger.info(`🎉 ユーザー ${userId} がレベル ${user.level} に上がりました！`);
        }

        this.userData.set(userId, user);
    }

    private async handleCommand(message: Message): Promise<void> {
        const args = message.content.slice(this.config.prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        if (!command) return;

        // クールダウンチェック
        if (this.isOnCooldown(message.author.id, command)) {
            const cooldownTime = this.getCooldown(message.author.id, command);
            const remaining = Math.ceil((cooldownTime - Date.now()) / 1000);
            
            await message.reply(`⏰ このコマンドは ${remaining}秒後に使用できます`);
            return;
        }

        // コマンド処理
        switch (command) {
            case 'ping':
                await this.commandPing(message);
                break;
            
            case 'stats':
                await this.commandStats(message);
                break;
            
            case 'userinfo':
                await this.commandUserInfo(message, args);
                break;
            
            case 'level':
                await this.commandLevel(message);
                break;
            
            case 'help':
                await this.commandHelp(message);
                break;
            
            case 'admin':
                await this.commandAdmin(message, args);
                break;
            
            case 'clean':
                await this.commandClean(message, args);
                break;
            
            default:
                await message.reply(`❌ 不明なコマンドです。\`${this.config.prefix}help\` で確認してください。`);
        }

        // クールダウンを設定
        this.setCooldown(message.author.id, command, 3000); // 3秒
    }

    private async handleRegularMessage(message: Message): Promise<void> {
        // キーワードに反応
        const keywords = [
            { word: 'おはよう', response: 'おはようございます！' },
            { word: 'こんにちは', response: 'こんにちは！' },
            { word: 'こんばんは', response: 'こんばんは！' },
            { word: 'ありがとう', response: 'どういたしまして！' },
            { word: 'さようなら', response: 'さようなら！またお会いしましょう！' }
        ];

        for (const { word, response } of keywords) {
            if (message.content.includes(word)) {
                await message.reply(response);
                break;
            }
        }

        // メンションされたら反応
        if (message.mentions.has(this.client.user!.id)) {
            await message.reply(`呼びましたか？ \`${this.config.prefix}help\` でコマンド一覧を確認できます！`);
        }
    }

    private async onGuildMemberAdd(member: GuildMember): Promise<void> {
        logger.info(`👤 新規メンバー: ${member.user.tag}`);

        const channelId = this.config.welcomeChannel || member.guild.systemChannelId;
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId) as TextChannel;
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('🎉 新規メンバー参加！')
            .setDescription(`ようこそ、${member.user}さん！`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'メンバー名', value: member.user.tag, inline: true },
                { name: 'アカウント作成日', 
                  value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`, 
                  inline: true },
                { name: 'サーバー人数', 
                  value: `${member.guild.memberCount}人`, 
                  inline: true }
            )
            .setFooter({ text: '歓迎いたします！' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        await channel.send(`自己紹介チャンネルで自己紹介をお願いします！`);

        // デフォルトロールを付与
        const defaultRole = member.guild.roles.cache.find(role => role.name === 'メンバー');
        if (defaultRole) {
            try {
                await member.roles.add(defaultRole);
            } catch (error) {
                logger.error(`ロール付与エラー: ${error}`);
            }
        }
    }

    private async onGuildMemberRemove(member: GuildMember): Promise<void> {
        logger.info(`👋 メンバー退出: ${member.user.tag}`);

        const channelId = this.config.welcomeChannel || member.guild.systemChannelId;
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId) as TextChannel;
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('👋 メンバー退出')
            .setDescription(`${member.user.tag} さんが去っていきました`)
            .addFields(
                { name: '参加日', 
                  value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:D>` : '不明', 
                  inline: true },
                { name: '残りメンバー', 
                  value: `${member.guild.memberCount}人`, 
                  inline: true }
            )
            .setFooter({ text: 'またのご利用をお待ちしています' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }

    private onError(error: Error): void {
        logger.error(`Botエラー: ${error.message}`);
        logger.error(error.stack || 'スタックトレースなし');
    }

    private onWarn(warning: string): void {
        logger.warn(`Bot警告: ${warning}`);
    }

    // コマンド実装
    private async commandPing(message: Message): Promise<void> {
        const sent = await message.reply('🏓 Pinging...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(this.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📡 メッセージ遅延', value: `${latency}ms`, inline: true },
                { name: '🌐 API遅延', value: `${apiLatency}ms`, inline: true },
                { name: '💓 ハートビート', value: `${this.client.ws.ping}ms`, inline: true }
            )
            .setFooter({ text: 'Ping/Pongテスト' })
            .setTimestamp();

        await sent.edit({ content: null, embeds: [embed] });
    }

    private async commandStats(message: Message): Promise<void> {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setColor('#9B84EE')
            .setTitle('📊 Bot統計情報')
            .addFields(
                { name: '🏠 サーバー数', 
                  value: `${this.client.guilds.cache.size}`, 
                  inline: true },
                { name: '👥 総ユーザー数', 
                  value: `${this.client.users.cache.size}`, 
                  inline: true },
                { name: '💬 総チャンネル数', 
                  value: `${this.client.channels.cache.size}`, 
                  inline: true },
                { name: '⏱️ アップタイム', 
                  value: `${hours}h ${minutes}m ${seconds}s`, 
                  inline: true },
                { name: '📈 メッセージ数', 
                  value: `${Array.from(this.userData.values())
                    .reduce((sum, user) => sum + user.messageCount, 0)}`, 
                  inline: true },
                { name: '🎮 アクティブユーザー', 
                  value: `${this.userData.size}`, 
                  inline: true }
            )
            .setFooter({ 
                text: `${this.client.user?.tag} - TypeScript Bot`,
                iconURL: this.client.user?.displayAvatarURL() 
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    private async commandUserInfo(message: Message, args: string[]): Promise<void> {
        const user = message.mentions.users.first() || 
                    (args[0] ? await this.client.users.fetch(args[0]).catch(() => null) : null) || 
                    message.author;

        const member = message.guild?.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor('#EB459E')
            .setTitle(`👤 ${user.tag} の情報`)
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '📛 ユーザー名', value: user.tag, inline: true },
                { name: '🆔 ユーザーID', value: user.id, inline: true },
                { name: '📅 アカウント作成日', 
                  value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, 
                  inline: true }
            );

        if (member) {
            embed.addFields(
                { name: '🎭 表示名', value: member.displayName, inline: true },
                { name: '📅 サーバー参加日', 
                  value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>` : '不明', 
                  inline: true },
                { name: '🎖️ ロール数', 
                  value: `${member.roles.cache.size - 1}`, // @everyoneを除く
                  inline: true }
            );

            const roles = member.roles.cache
                .filter(role => role.id !== message.guild!.id)
                .map(role => role.toString())
                .join(', ') || 'なし';

            if (roles.length > 1024) {
                embed.addFields({ 
                    name: '🎖️ ロール', 
                    value: `${member.roles.cache.size - 1}個のロールを持っています` 
                });
            } else {
                embed.addFields({ name: '🎖️ ロール', value: roles || 'なし' });
            }
        }

        const userData = this.userData.get(user.id);
        if (userData) {
            embed.addFields(
                { name: '📊 メッセージ数', value: `${userData.messageCount}`, inline: true },
                { name: '⭐ レベル', value: `${userData.level}`, inline: true },
                { name: '⚡ XP', value: `${userData.xp}`, inline: true }
            );
        }

        embed.setFooter({ text: 'ユーザー情報' })
             .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    private async commandLevel(message: Message): Promise<void> {
        const userData = this.userData.get(message.author.id);

        if (!userData) {
            await message.reply('📊 あなたのデータはまだ記録されていません');
            return;
        }

        const xpForNextLevel = userData.level * 100;
        const progress = (userData.xp / xpForNextLevel) * 100;
        const progressBar = this.createProgressBar(progress, 20);

        const embed = new EmbedBuilder()
            .setColor('#FAA61A')
            .setTitle(`📈 ${message.author.username} のレベル情報`)
            .setThumbnail(message.author.displayAvatarURL({ size: 128 }))
            .addFields(
                { name: '⭐ 現在のレベル', value: `**${userData.level}**`, inline: true },
                { name: '⚡ 現在のXP', value: `**${userData.xp}** / ${xpForNextLevel}`, inline: true },
                { name: '📊 メッセージ数', value: `**${userData.messageCount}**`, inline: true },
                { name: '📅 最終アクティブ', 
                  value: `<t:${Math.floor(userData.lastActive.getTime() / 1000)}:R>`, 
                  inline: true },
                { name: '📈 進捗状況', 
                  value: `${progressBar}\n${progress.toFixed(1)}%`, 
                  inline: false }
            )
            .setFooter({ text: 'レベルシステム' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    private createProgressBar(percentage: number, length: number): string {
        const filled = Math.round((percentage / 100) * length);
        const empty = length - filled;
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
    }

    private async commandHelp(message: Message): Promise<void> {
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('📚 ヘルプ - 高度なBot')
            .setDescription(`プレフィックス: \`${this.config.prefix}\``)
            .addFields(
                { 
                    name: '🎮 一般コマンド', 
                    value: [
                        `\`${this.config.prefix}ping\` - 応答速度を確認`,
                        `\`${this.config.prefix}stats\` - Botの統計情報を表示`,
                        `\`${this.config.prefix}userinfo [ユーザー]\` - ユーザー情報を表示`,
                        `\`${this.config.prefix}level\` - 自分のレベルを確認`,
                        `\`${this.config.prefix}help\` - このヘルプを表示`
                    ].join('\n') 
                },
                { 
                    name: '🛠️ 管理コマンド', 
                    value: [
                        `\`${this.config.prefix}admin\` - 管理者コマンド`,
                        `\`${this.config.prefix}clean [数]\` - メッセージを削除`
                    ].join('\n') 
                }
            )
            .setFooter({ 
                text: `${this.client.user?.tag} - TypeScript Bot`,
                iconURL: this.client.user?.displayAvatarURL() 
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    private async commandAdmin(message: Message, args: string[]): Promise<void> {
        // 管理者権限チェック
        const member = message.member;
        if (!member || !member.permissions.has('Administrator')) {
            await message.reply('❌ このコマンドは管理者のみ使用できます');
            return;
        }

        const subCommand = args[0]?.toLowerCase();

        switch (subCommand) {
            case 'reload':
                await message.reply('🔄 設定を再読み込みします...');
                // 設定の再読み込みロジックをここに実装
                break;
            
            case 'shutdown':
                await message.reply('🛑 Botを停止します...');
                setTimeout(() => {
                    this.client.destroy();
                    process.exit(0);
                }, 1000);
                break;
            
            case 'broadcast':
                const broadcastMessage = args.slice(1).join(' ');
                if (!broadcastMessage) {
                    await message.reply('❌ ブロードキャストするメッセージを指定してください');
                    return;
                }

                let sentCount = 0;
                for (const guild of this.client.guilds.cache.values()) {
                    const channel = guild.systemChannel || 
                                   guild.channels.cache.find(ch => 
                                       ch.isTextBased() && 
                                       ch.permissionsFor(guild.members.me!).has('SEND_MESSAGES')
                                   );
                    
                    if (channel && channel.isTextBased()) {
                        try {
                            await channel.send(`📢 **ブロードキャスト**: ${broadcastMessage}`);
                            sentCount++;
                        } catch (error) {
                            logger.error(`ブロードキャストエラー (${guild.name}): ${error}`);
                        }
                    }
                }

                await message.reply(`✅ ${sentCount}個のサーバーにブロードキャストしました`);
                break;
            
            default:
                const embed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('🛠️ 管理者コマンド')
                    .setDescription(`管理者用コマンド一覧`)
                    .addFields(
                        { name: 'reload', value: '設定を再読み込み', inline: true },
                        { name: 'shutdown', value: 'Botを停止', inline: true },
                        { name: 'broadcast <メッセージ>', value: '全サーバーにメッセージを送信', inline: true }
                    )
                    .setFooter({ text: '管理者専用' })
                    .setTimestamp();
                
                await message.reply({ embeds: [embed] });
        }
    }

    private async commandClean(message: Message, args: string[]): Promise<void> {
        // メッセージ管理権限チェック
        if (!message.member?.permissions.has('ManageMessages')) {
            await message.reply('❌ メッセージを管理する権限が必要です');
            return;
        }

        const amount = parseInt(args[0]) || 10;
        if (amount < 1 || amount > 100) {
            await message.reply('❌ 削除するメッセージ数は1〜100の間で指定してください');
            return;
        }

        try {
            const deleted = await message.channel.bulkDelete(amount + 1, true); // +1 はコマンドメッセージ
            await message.reply(`✅ ${deleted.size - 1}件のメッセージを削除しました`)
                .then(msg => setTimeout(() => msg.delete(), 3000));
        } catch (error) {
            await message.reply('❌ メッセージの削除に失敗しました（古すぎるメッセージは削除できません）');
            logger.error(`メッセージ削除エラー: ${error}`);
        }
    }

    // クールダウン管理
    private isOnCooldown(userId: string, command: string): boolean {
        const userCooldowns = this.cooldowns.get(userId);
        if (!userCooldowns) return false;

        const cooldownTime = userCooldowns.get(command);
        if (!cooldownTime) return false;

        return Date.now() < cooldownTime;
    }

    private getCooldown(userId: string, command: string): number {
        const userCooldowns = this.cooldowns.get(userId);
        if (!userCooldowns) return 0;

        return userCooldowns.get(command) || 0;
    }

    private setCooldown(userId: string, command: string, cooldown: number): void {
        if (!this.cooldowns.has(userId)) {
            this.cooldowns.set(userId, new Map());
        }

        const userCooldowns = this.cooldowns.get(userId)!;
        userCooldowns.set(command, Date.now() + cooldown);

        // 古いクールダウンをクリーンアップ
        setTimeout(() => {
            userCooldowns.delete(command);
            if (userCooldowns.size === 0) {
                this.cooldowns.delete(userId);
            }
        }, cooldown);
    }

    // Botの起動
    public async start(): Promise<void> {
        const token = process.env.DISCORD_TOKEN;
        if (!token) {
            logger.error('❌ DISCORD_TOKENが設定されていません');
            process.exit(1);
        }

        try {
            await this.client.login(token);
            logger.info('🤖 Botが起動しました');
        } catch (error) {
            logger.error(`❌ ログインに失敗しました: ${error}`);
            process.exit(1);
        }
    }

    // グレースフルシャットダウン
    public async shutdown(): Promise<void> {
        logger.info('🛑 Botを停止しています...');
        this.client.destroy();
        logger.info('✅ Botが停止しました');
    }
}

// アプリケーションのエントリーポイント
const bot = new AdvancedDiscordBot();

// シグナルハンドリング
process.on('SIGINT', async () => {
    await bot.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await bot.shutdown();
    process.exit(0);
});

// 未処理のプロミス拒否をログに記録
process.on('unhandledRejection', (reason, promise) => {
    logger.error('未処理のプロミス拒否:', reason);
});

// Botの起動
bot.start().catch(error => {
    logger.error(`Botの起動に失敗しました: ${error}`);
    process.exit(1);
});
