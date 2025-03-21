# Webドキュメント翻訳・要約・検索システム

## 概要

Web上に公開されている公式ドキュメントを翻訳・要約し、検索可能な形で管理するシステムです。

## 使い方

1.  リポジトリをクローンします。
2.  `.env`ファイルにGoogle Gemini APIのAPIキーを設定します。
3.  依存関係をインストールします。
    ```
    npm install
    ```
4.  CLIツールを実行します。
    ```
    npm run start -- url https://some_domain --depth 2 --allow-domains https://some_allowed_domain
    ```

## コマンド

*   `url`: Webコンテンツを処理します。
*   `input`: ローカルファイルを処理します。

## オプション

*   `url` コマンド
    *   `--url <URL>`: 解析対象のURL（必須）
    *   `--depth <number>`: 探索の深さ（デフォルト: 3）
    *   `--language <lang>`: 翻訳言語（デフォルト: ja）
    *   `--summary-only`: 要約のみ実行
    *   `--translate-only`: 翻訳のみ実行
    *   `--allow-domains <domains>`: 許可ドメインの指定
    *   `--force-fetch`: キャッシュを無視して再取得
*   `input` コマンド
    *   `--language <lang>`: 翻訳言語（デフォルト: ja）
    *   `--summary-only`: 要約のみ実行
    *   `--translate-only`: 翻訳のみ実行

## 出力先のディレクトリ構成

```
output/
├── <ドメイン名>/          # Webコンテンツの出力
│   ├── markdown/
│   ├── translation/
│   ├── summary/
├── input/          # ローカルファイルの出力
│   ├── markdown/
│   ├── translation/
│   ├── summary/
```

*   Webコンテンツの場合、`output/<ドメイン名>/` に出力されます。
*   ローカルファイルの場合、`output/input/` に出力されます。
