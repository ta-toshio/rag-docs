# プロジェクト概要

Webドキュメント翻訳・要約・検索システム

## プロジェクトの目的

Web上に公開されている公式ドキュメントを翻訳・要約し、検索可能な形で管理するシステムを提供する。

## 主な機能

- CLIによるドキュメント探索・翻訳・要約
- Qdrantによるベクトル検索
- Google Gemini APIを活用した翻訳・要約・RAG検索
- ローカルフォルダ内のファイル処理

## 機能要件

- CLIツール (`translate-docs`)
    - Webコンテンツの処理 (`--url`)
    - ローカルファイルの処理 (`--input`)
    - CLIオプション

## 非機能要件

- パフォーマンス
- セキュリティ
- 運用・保守

## 制約条件

- Google Gemini APIの利用制限
- QdrantをDockerでローカル環境に構築
- 検索は基本的にWeb UIで行う
- CLIの`--url`オプションは必須

## 開発環境

- 言語: TypeScript
- CLI実行環境: Node.js
- データベース: Qdrant
- 埋め込みモデル: Google Gemini API
- 検索エンジン: Qdrant
- ベクトル検索: Qdrant（Docker）

## 成果物

- CLIツール (`translate-docs`)
- Qdrantによる検索機能
- 要件定義書・設計書
- セットアップ用 README