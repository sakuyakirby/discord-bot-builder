# シンプルなDiscord Bot - Python版
# このコードはDiscord Bot Builderで生成されました

import discord
import os
import random
from datetime import datetime
from discord.ext import commands
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

# インテントの設定
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

# Botの設定
bot = commands.Bot(command_prefix='!', intents=intents)

# 変数の初期化
message_count = 0
user_responses = {}

# Bot起動時の処理
@bot.event
async def on_ready():
    print(f'✅ Botが起動しました: {bot.user}')
    print(f'📊 サーバー数: {len(bot.guilds)}')
    
    # アクティビティを設定
    await bot.change_presence(
        activity=discord.Game(name="Python Bot | !help")
    )

# メッセージ受信時の処理
@bot.event
async def on_message(message):
    global message_count
    
    # Bot自身のメッセージは無視
    if message.author.bot:
        return
    
    # メッセージカウントを増加
    message_count += 1
    
    # ユーザーの応答回数を記録
    user_id = str(message.author.id)
    user_responses[user_id] = user_responses.get(user_id, 0) + 1
    
    # コマンド処理を継続
    await bot.process_commands(message)

# 基本的なコマンド
@bot.command()
async def ping(ctx):
    """Pingコマンド - 応答速度を確認"""
    latency = round(bot.latency * 1000)
    await ctx.send(f'🏓 Pong! {latency}ms')

@bot.command()
async def hello(ctx):
    """挨拶コマンド"""
    greetings = [
        f'こんにちは、{ctx.author.name}さん！',
        f'やあ、{ctx.author.name}！元気？',
        f'ようこそ、{ctx.author.name}さん！',
        f'ハロー、{ctx.author.name}！'
    ]
    await ctx.send(random.choice(greetings))

@bot.command()
async def time(ctx):
    """現在時刻を表示"""
    now = datetime.now()
    time_str = now.strftime('%Y年%m月%d日 %H時%M分%S秒')
    await ctx.send(f'🕒 現在時刻: {time_str}')

@bot.command()
async def roll(ctx, dice: str = '1d6'):
    """ダイスロールコマンド (例: !roll 2d20)"""
    try:
        number, sides = map(int, dice.split('d'))
        if number > 10:
            await ctx.send('❌ ダイスの数は10個までです')
            return
        if sides > 100:
            await ctx.send('❌ ダイスの面数は100までです')
            return
        
        results = [random.randint(1, sides) for _ in range(number)]
        total = sum(results)
        
        if number == 1:
            await ctx.send(f'🎲 結果: **{results[0]}** (1d{sides})')
        else:
            results_str = ', '.join(map(str, results))
            await ctx.send(f'🎲 結果: {results_str}\n合計: **{total}** ({dice})')
            
    except ValueError:
        await ctx.send('❌ 正しい形式で入力してください (例: !roll 2d6)')

@bot.command()
async def choose(ctx, *choices):
    """選択肢からランダムに選ぶ (例: !choose りんご みかん バナナ)"""
    if len(choices) < 2:
        await ctx.send('❌ 2つ以上の選択肢を入力してください')
        return
    
    chosen = random.choice(choices)
    await ctx.send(f'🤔 私の選択: **{chosen}**')

@bot.command()
async def stats(ctx):
    """Botの統計情報を表示"""
    embed = discord.Embed(
        title='📊 Bot統計情報',
        color=discord.Color.blue(),
        timestamp=datetime.now()
    )
    
    embed.add_field(name='サーバー数', value=str(len(bot.guilds)), inline=True)
    embed.add_field(name='総メッセージ数', value=str(message_count), inline=True)
    embed.add_field(name='ユニークユーザー数', value=str(len(user_responses)), inline=True)
    
    # 最もアクティブなユーザー
    if user_responses:
        top_user_id = max(user_responses, key=user_responses.get)
        top_user = await bot.fetch_user(int(top_user_id))
        top_count = user_responses[top_user_id]
        embed.add_field(name='最もアクティブなユーザー', value=f'{top_user.name}: {top_count}回', inline=False)
    
    embed.add_field(name='Ping', value=f'{round(bot.latency * 1000)}ms', inline=True)
    embed.add_field(name='起動時間', value=bot.user.created_at.strftime('%Y/%m/%d'), inline=True)
    
    embed.set_footer(text=f'{bot.user.name} 統計')
    
    await ctx.send(embed=embed)

@bot.command()
async def help_custom(ctx):
    """カスタムヘルプコマンド"""
    embed = discord.Embed(
        title='📚 ヘルプ - シンプルBot',
        description='利用可能なコマンド一覧',
        color=discord.Color.green()
    )
    
    commands_info = [
        ('!ping', 'Botの応答速度を確認'),
        ('!hello', 'Botが挨拶します'),
        ('!time', '現在時刻を表示'),
        ('!roll <ダイス>', 'ダイスを振ります (例: !roll 2d6)'),
        ('!choose <選択肢...>', '選択肢からランダムに選びます'),
        ('!stats', 'Botの統計情報を表示'),
        ('!help_custom', 'このヘルプを表示')
    ]
    
    for cmd, desc in commands_info:
        embed.add_field(name=cmd, value=desc, inline=False)
    
    embed.set_footer(text=f'{bot.user.name} - Python Bot')
    
    await ctx.send(embed=embed)

# メンバー参加時の処理
@bot.event
async def on_member_join(member):
    channel = member.guild.system_channel
    if channel:
        welcome_messages = [
            f'🎉 ようこそ、{member.mention} さん！',
            f'✨ いらっしゃいませ、{member.mention} さん！',
            f'👋 こんにちは、{member.mention} さん！歓迎します！'
        ]
        
        embed = discord.Embed(
            title='新規メンバー参加！',
            description=random.choice(welcome_messages),
            color=discord.Color.green(),
            timestamp=datetime.now()
        )
        
        embed.set_thumbnail(url=member.avatar.url if member.avatar else member.default_avatar.url)
        embed.add_field(name='メンバー名', value=member.name, inline=True)
        embed.add_field(name='サーバー人数', value=member.guild.member_count, inline=True)
        embed.set_footer(text='歓迎Bot')
        
        await channel.send(embed=embed)

# メンバー退出時の処理
@bot.event
async def on_member_remove(member):
    channel = member.guild.system_channel
    if channel:
        goodbye_messages = [
            f'👋 さようなら、{member.name}さん...',
            f'😢 {member.name}さんが去っていきました',
            f'💨 {member.name}さん、また会いましょう！'
        ]
        
        embed = discord.Embed(
            title='メンバー退出',
            description=random.choice(goodbye_messages),
            color=discord.Color.red(),
            timestamp=datetime.now()
        )
        
        embed.add_field(name='メンバー名', value=member.name, inline=True)
        embed.add_field(name='残りメンバー数', value=member.guild.member_count, inline=True)
        embed.set_footer(text='歓迎Bot')
        
        await channel.send(embed=embed)

# エラーハンドリング
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        await ctx.send('❌ そのコマンドは存在しません。`!help_custom` で確認してください。')
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send('❌ 引数が不足しています。`!help_custom` で確認してください。')
    else:
        await ctx.send(f'❌ エラーが発生しました: {str(error)}')
        print(f'コマンドエラー: {error}')

# Botの実行
if __name__ == '__main__':
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        print('❌ DISCORD_TOKENが設定されていません')
        print('.envファイルを作成し、DISCORD_TOKEN=your_token_here を追加してください')
        exit(1)
    
    try:
        bot.run(token)
    except discord.LoginFailure:
        print('❌ トークンが無効です。正しいトークンを設定してください')
    except Exception as e:
        print(f'❌ Botの実行中にエラーが発生しました: {e}')
