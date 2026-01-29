// 音楽Bot - 自動生成コード
// 注意: 実際の音楽再生には追加のライブラリが必要です

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

// クライアントの設定
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// 音楽キュー（簡易実装）
const musicQueues = new Map();

// Bot起動時
client.on('ready', () => {
    console.log(`✅ 音楽Botが起動しました: ${client.user.tag}`);
    client.user.setActivity('🎵 音楽を再生中', { type: 'LISTENING' });
});

// メッセージ受信時
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // コマンド: !play
    if (message.content.startsWith('!play')) {
        const args = message.content.split(' ').slice(1);
        const song = args.join(' ');
        
        if (!song) {
            await message.reply('🎵 再生したい曲名またはURLを指定してください！');
            return;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('🎵 音楽再生')
            .setDescription(`**${song}** を再生します！`)
            .addFields(
                { name: 'リクエスト者', value: message.author.tag, inline: true },
                { name: 'ステータス', value: 'キューに追加', inline: true }
            )
            .setFooter({ text: '音楽Bot' })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
        
        // キューに追加（簡易実装）
        if (!musicQueues.has(message.guild.id)) {
            musicQueues.set(message.guild.id, []);
        }
        
        const queue = musicQueues.get(message.guild.id);
        queue.push({
            title: song,
            requester: message.author.tag,
            url: song.startsWith('http') ? song : null
        });
        
        // キュー情報を表示
        if (queue.length === 1) {
            await playMusic(message, queue);
        }
    }
    
    // コマンド: !stop
    if (message.content.startsWith('!stop')) {
        if (musicQueues.has(message.guild.id)) {
            musicQueues.delete(message.guild.id);
        }
        
        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('⏹️ 音楽停止')
            .setDescription('音楽再生を停止しました')
            .setFooter({ text: '音楽Bot' })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
    }
    
    // コマンド: !queue
    if (message.content.startsWith('!queue')) {
        const queue = musicQueues.get(message.guild.id) || [];
        
        if (queue.length === 0) {
            await message.reply('📭 再生キューは空です');
            return;
        }
        
        const queueList = queue.map((song, index) => 
            `${index + 1}. **${song.title}** - ${song.requester}`
        ).join('\n');
        
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📋 再生キュー')
            .setDescription(queueList)
            .addFields(
                { name: '合計曲数', value: `${queue.length}曲`, inline: true },
                { name: '現在再生中', value: queue[0]?.title || 'なし', inline: true }
            )
            .setFooter({ text: '音楽Bot' })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
    }
    
    // コマンド: !skip
    if (message.content.startsWith('!skip')) {
        const queue = musicQueues.get(message.guild.id);
        if (!queue || queue.length === 0) {
            await message.reply('📭 スキップする曲がありません');
            return;
        }
        
        const skipped = queue.shift();
        const embed = new EmbedBuilder()
            .setColor('#FAA61A')
            .setTitle('⏭️ 曲をスキップ')
            .setDescription(`**${skipped.title}** をスキップしました`)
            .setFooter({ text: '音楽Bot' })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
        
        // 次の曲を再生
        if (queue.length > 0) {
            await playMusic(message, queue);
        }
    }
    
    // コマンド: !volume
    if (message.content.startsWith('!volume')) {
        const args = message.content.split(' ').slice(1);
        const volume = parseInt(args[0]);
        
        if (isNaN(volume) || volume < 0 || volume > 100) {
            await message.reply('🔊 ボリュームは0〜100の間で指定してください');
            return;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#9B84EE')
            .setTitle('🔊 ボリューム設定')
            .setDescription(`ボリュームを **${volume}%** に設定しました`)
            .setFooter({ text: '音楽Bot' })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
    }
    
    // コマンド: !nowplaying
    if (message.content.startsWith('!nowplaying') || message.content.startsWith('!np')) {
        const queue = musicQueues.get(message.guild.id);
        const currentSong = queue?.[0];
        
        if (!currentSong) {
            await message.reply('🎵 現在再生中の曲はありません');
            return;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#EB459E')
            .setTitle('🎶 現在再生中')
            .setDescription(`**${currentSong.title}**`)
            .addFields(
                { name: 'リクエスト者', value: currentSong.requester, inline: true },
                { name: 'キュー残り', value: `${queue.length}曲`, inline: true }
            )
            .setFooter({ text: '音楽Bot' })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
    }
    
    // コマンド: !help-music
    if (message.content.startsWith('!help-music')) {
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('🎵 音楽Bot ヘルプ')
            .setDescription('利用可能なコマンド一覧')
            .addFields(
                { name: '!play <曲名/URL>', value: '曲を再生またはキューに追加', inline: true },
                { name: '!stop', value: '音楽再生を停止', inline: true },
                { name: '!queue', value: '再生キューを表示', inline: true },
                { name: '!skip', value: '現在の曲をスキップ', inline: true },
                { name: '!volume <0-100>', value: 'ボリュームを設定', inline: true },
                { name: '!nowplaying / !np', value: '現在の曲を表示', inline: true }
            )
            .setFooter({ text: '音楽Bot - 概念実証版' })
            .setTimestamp();
        
        await message.channel.send({ embeds: [embed] });
    }
});

// 音楽再生関数（簡易実装）
async function playMusic(message, queue) {
    const currentSong = queue[0];
    
    if (!currentSong) return;
    
    const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('▶️ 再生開始')
        .setDescription(`**${currentSong.title}** の再生を開始します`)
        .addFields(
            { name: 'リクエスト者', value: currentSong.requester, inline: true },
            { name: '再生時間', value: '3:00（デモ）', inline: true }
        )
        .setFooter({ text: '音楽Bot' })
        .setTimestamp();
    
    const statusMessage = await message.channel.send({ embeds: [embed] });
    
    // デモ用: 3秒後に再生完了をシミュレート
    setTimeout(async () => {
        const nextSong = queue.shift();
        
        if (nextSong) {
            const completeEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('✅ 再生完了')
                .setDescription(`**${nextSong.title}** の再生が完了しました`)
                .setFooter({ text: '音楽Bot' })
                .setTimestamp();
            
            await statusMessage.edit({ embeds: [completeEmbed] });
            
            // 次の曲があれば再生
            if (queue.length > 0) {
                setTimeout(() => playMusic(message, queue), 1000);
            }
        }
    }, 3000);
}

// エラーハンドリング
client.on('error', console.error);
process.on('unhandledRejection', console.error);

// Botのログイン
client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('音楽Botがログインしました'))
    .catch(error => {
        console.error('ログインに失敗しました:', error);
        process.exit(1);
    });
