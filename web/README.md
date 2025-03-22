# Webドキュメント翻訳・要約・検索システム

## プロジェクト概要

本プロジェクトは、Web上に公開されている公式ドキュメントを翻訳・要約し、検索可能な形で管理するシステムを提供します。CLIツールを使用してドキュメントを収集・翻訳を行います。

## 主な機能

- CLIによるドキュメント探索・翻訳・要約
- Qdrantによるベクトル検索
- Google Gemini APIを活用した翻訳・要約・RAG検索
- ローカルフォルダ内のファイル処理（`input/`フォルダ対応）

## 使用技術

- **言語**: TypeScript
- **CLI実行環境**: Node.js
- **Webアプリ**: Next.js
- **データ管理**: Qdrant
- **埋め込みモデル**: Google Gemini API
- **検索エンジン**: Qdrant

## セットアップ

### 必要条件

- Node.js
- Docker

### インストール

1. リポジトリをクローンします。

    ```sh
    git clone https://github.com/your-repo/doc-translator.git
    cd doc-translator
    ```

2. 依存関係をインストールします。

    ```sh
    pnpm install
    ```

3. 環境変数を設定します。`.env`ファイルを作成し、必要なAPIキーや設定を追加します。

    ```plaintext
    GOOGLE_GEMINI_API_KEY=your_api_key
    ```

### 実行

#### CLIツールの使用

先にCLIツールからデータの登録が必要です

CLI側のREADME.mdを参照してください。

#### Webアプリの起動

```sh
pnpm dev
```


