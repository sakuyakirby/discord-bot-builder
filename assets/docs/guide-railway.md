# RailwayでDiscord Botをホスティングする方法

## 概要
Railwayは、簡単にアプリケーションをデプロイできるプラットフォームです。Discord Botのホスティングに最適です。

## ステップ1: Railwayアカウント作成

1. [Railwayのウェブサイト](https://railway.app)にアクセス
2. GitHubアカウントでログイン
3. 無料クレジットが付与されます（$5相当）

## ステップ2: 新しいプロジェクト作成

### 方法A: GitHubからデプロイ（推奨）
1. "New Project"をクリック
2. "Deploy from GitHub repo"を選択
3. GitHubリポジトリを選択または新規作成
4. リポジトリをインポート

### 方法B: テンプレートから作成
1. "New Project"をクリック
2. "Deploy a Template"を選択
3. Node.jsテンプレートを選択
4. プロジェクト名を設定

### 方法C: CLIからデプロイ
```bash
# Railway CLIをインストール
npm i -g @railway/cli

# ログイン
railway login

# 新しいプロジェクト作成
railway init

# デプロイ
railway up
