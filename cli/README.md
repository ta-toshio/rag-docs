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
    translate-docs <command> [options]
    ```

## コマンド

*   `url`: Webコンテンツを処理します。
*   `input`: ローカルファイルを処理します。

## オプション

*   `--url <URL>`: 解析対象のURL（必須）
*   `--depth <number>`: 探索の深さ（デフォルト: 3）
*   `--language <lang>`: 翻訳言語（デフォルト: ja）
*   `--summary-only`: 要約のみ実行
*   `--translate-only`: 翻訳のみ実行
*   `--allow-domains <domains>`: 許可ドメインの指定
*   `--input`: ローカルの`input/`フォルダ内のファイルを処理（必須）