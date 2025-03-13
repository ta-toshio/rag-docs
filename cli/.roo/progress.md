# 進捗状況

## **📌 マイルストーン 1: CLI (`translate-docs`) の基本機能実装（詳細タスク分割 + カテゴリ + 進捗管理 + シーケンス番号）**

| **#** | **カテゴリ**          | **タスク** | **詳細** | **実装対象ファイル** | **仕様書** | **使用したモデル** | **進捗** |
|----|------------------|------------------------------------------|---------------------------|----------------|----------------|----------------|------|
| 1  | **CLI エントリーポイント** | **CLI のエントリーポイント実装** | `translate-docs` の CLI コマンドを作成 | `cli.ts` |  |  | ✅ |
| 2  |                   | **コマンドライン引数のパース** | `--url` / `--input` などのオプション処理 | `cli.ts` |  |  | ✅ |
| 3  | **Webページの解析**  | 指定した URL から HTML を取得する | | `src/crawler/crawler.ts` `src/crawler/htmlUtils.ts` `src/crawler/linkProcessor.ts` `src/crawler/urlUtils.ts` | `sitemapGenerator.md` |  | ✅ |
| 4  |                   | `fetch` フラグを考慮して取得対象を判定する | | `crawler.ts` | `sitemapGenerator.md` |  | ✅ |
| 5  |                   | **サイトマップを作成する（新規）** | | `fileWriter.ts` | `sitemapGenerator.md` |  | ✅ |
| 6  |                   | - **ページ内のリンクを抽出** | | `src/crawler/crawler.ts` | `sitemapGenerator.md` |  | ✅ |
| 7  |                   | - **サイトマップデータを JSON に保存** | | `src/fileWriter.ts` | `sitemapGenerator.md` |  | ✅ |
| 8  |                   | - **探索深度 (`--depth`) を適用** | | `crawler.ts` | `depth.md` |  | ✅ |
| 9  |                   | - **同一ドメインのみを対象にする** | | `src/crawler/crawler.ts` | `sitemapGenerator.md` |  | ✅ |
| 10 |                   | - **許可ドメイン (`--allow-domains`) を考慮** | | `src/crawler/crawler.ts` | `sitemapGenerator.md` |  | ✅ |
| 11 |                   | - **サイトマップ内での出現順を記録する** | | `src/sorter.ts` | `sitemapGenerator.md` |  | ✅ |
| 12 |                   | - **URL を絶対パスに統一する** | | `src/crawler/crawler.ts` | `sitemapGenerator.md` |  | ✅ |
| 13 |                   | - **サイトマップの並び順を調整する** | | `src/sorter.ts` | `sitemapGenerator.md` |  | ✅ |
| 14 |                   | - **ディレクトリ単位でグループ化** | | `sorter.ts` | `sitemapGenerator.md` |  | ✅ |
| 15 |                   | - **グループ内の順番は取得順を維持する** | | `sorter.ts` | `sitemapGenerator.md` |  | ✅ |
| 16 |                   | - **サイトマップの JSON 出力フォーマットを統一** | | `src/fileWriter.ts` | `sitemapGenerator.md` |  | ✅ |
| 17 | **HTML の取得**    | `fetch: true` のページの HTML を取得する | | `src/crawler/crawler.ts` | `sitemapGenerator.md` |  | ✅ |
| 18 |                   | 取得した HTML を `output/sample.com/html/` に保存 | | `src/fileWriter.ts` | `sitemapGenerator.md` |  | ✅ |
| 19 |                   | **キャッシュを活用して不要な取得を防ぐ**（新規） | | `src/crawler/crawler.ts` | `sitemapGenerator.md` |  | ✅ |
| 20 |                   | - **HTML ファイルが既に存在する場合は取得しない** | | `src/crawler/crawler.ts` | `sitemapGenerator.md` |  | ✅ |
| 21 |                   | - **`--force-fetch` オプション時は再取得** | | `src/crawler/crawler.ts` | `sitemapGenerator.md` |  | ✅ |

## **📌 マイルストーン 1.5: HTML を Markdown に変換し、翻訳・要約を実施（更新後）**

| **#** | **カテゴリ**            | **タスク** | **詳細** | **実装対象ファイル** | **仕様書** | **使用したモデル** | **進捗** |
|----|------------------|------------------------------------------|---------------------------|----------------|----------------|----------------|------|
| 1  | **HTML 解析**    | **ダウンロードした HTML を読み込む** | `output/sample.com/html/` 内の HTML を読み込む | `src/parser/parser.ts` | `toMarkdown.md` |  | ✅ |
| 2  |                  | **HTML を DOM にパースする** | `cheerio` などを使用して DOM ツリーを解析 | `src/parser/parser.ts` | `toMarkdown.md` |  | ✅ |
| 3  |                  | **不要なスクリプト・スタイルを除外** | `script` / `style` タグを削除 | `src/parser/parser.ts` | `toMarkdown.md` |  | ✅ |
| 4  |                  | **本文テキストを抽出する** | `main`, `article`, `p`, `h1~h6` などの要素を対象にテキストを取得 |  |  |  | ❌ (対応しない) |
| 5  | **Markdown 変換** | **HTML を Markdown に変換** | `turndown` などを利用して Markdown に変換 | `src/parser/markdownFormatter.ts` | `toMarkdown.md` |  | ✅ |
| 6  |                  | **リスト・表・コードブロックを適切に処理** | `ul`, `ol`, `table`, `pre` などを Markdown の書式に変換 | `src/parser/markdownFormatter.ts` | `toMarkdown.md` |  | ✅ |
| 7  |                  | **Markdown のフォーマットを統一** | インデント・改行のルールを統一する | `src/parser/markdownFormatter.ts` | `markdownFormatter.md` |  | ✅ |
| 8  | **ファイル出力**  | **Markdown を `output/sample.com/markdown/` に保存** | | `src/fileWriter.ts` |  |  | ✅ |
| 9  | **レート制限・リトライ機能** | **Google Gemini API のレートリミット制御を実装** | **Bottleneck を利用し、リクエスト間隔を管理** | `src/utils/rateLimiter.ts` | `rateLimit.md` |  | ✅ |
| 10 |                   | **翻訳 API・要約 API のリトライ処理を実装** | **エラーハンドリング & バックオフ制御を組み込む** | `src/utils/apiRetry.ts` |  |  | ✅ |
| 11 | **翻訳処理**      | **Markdown を翻訳対象として読み込む** | | `src/translator.ts` |  |  | ✅ |
| 12 |                  | **Google Gemini API を使用して翻訳を実施** | | `src/translator.ts` |  |  | ✅ |
| 13 |                  | **翻訳結果を `output/sample.com/translation/` に保存** | | `src/fileWriter.ts` |  |  | ✅ |
| 14 | **要約処理**      | **Markdown を要約対象として読み込む** | | `src/summarizer.ts` |  |  | ✅ |
| 15 |                  | **Google Gemini API を使用して要約を実施** | | `src/summarizer.ts` |  |  | ✅ |
| 16 |                  | **要約結果を `output/sample.com/summary/` に保存** | | `src/fileWriter.ts` |  |  | ✅ |
| 17 | **エラーハンドリング** | **HTML のパースエラーを処理** | | `src/parser/parser.ts` |  |  | ✅ |
| 18 |                  | **翻訳 API のエラーを処理** | | `src/translator.ts` |  |  | ✅ |
| 19 |                  | **要約 API のエラーを処理** | | `src/summarizer.ts` |  |  | ✅ |
| 20 | **ログ出力**      | **処理結果のログを `logs/` に出力** | | `src/logger.ts` |  |  | ✅ |
| 21 |                  | **console.log を logger に置き換え** | | `src/**/*.ts` |  |  | ✅ |

---


修正しました！ **スキーマ定義を `src/types/` に移動** し、`TypeScript の型定義` として管理するように変更しました。  

---

### **📌 マイルストーン2: SQLite & Qdrant データ管理・検索 実装タスクスケジュール（更新済み）**

| **#** | **カテゴリ**                      | **タスク** | **詳細** | **実装対象ファイル** | **仕様書** | **進捗** |
|----|-------------------------|------------------------------------------|---------------------------|----------------|--------------------------|------|
| 1  | **要件定義**          | **Qdrant + SQLite の要件定義書を作成** | データ構造や API 仕様を記述 | `.roo/docs/database.md` |  | ✅ |
| 2  | **環境構築**              | **Docker Compose で Qdrant & SQLite 環境構築** | `docker-compose.yml` で Qdrant サーバと SQLite セットアップ | `docker-compose.yml` | `.roo/docs/database.md` | ✅ |
| 3  | **データベース設計**      | **`file_tree_collection` のスキーマ設計** | TypeScript の型定義 (`id`, `resource_id`, `domain`, `name`, `type`, `path`, `parent`, `timestamp`) | `src/types/fileTreeSchema.ts` | `.roo/docs/database.md` | ✅ |
| 4  |                          | **`translation_collection` のスキーマ設計** | TypeScript の型定義 (`id`, `resource_id`, `title`, `summary`, `description`, `text`, `original_text`, `language`, `keywords`, `timestamp`) | `src/types/translationSchema.ts` | `.roo/docs/database.md` | ✅ |
| 5  |                          | **`vector_collection` のスキーマ設計** | TypeScript の型定義 (`id`, `resource_id`, `paragraph_index`, `vector`, `original_text`, `language`, `timestamp`) | `src/types/vectorSchema.ts` | `.roo/docs/database.md` | ✅ |
| 6  | **データ登録機能**        | **ファイルツリーのデータ登録を実装 (SQLite)** | sitemap.json から `file_tree_collection` に登録 | `src/sqlite/fileTreeHandler.ts` | `.roo/docs/database.md` | ⏳ |
| 7  |                          | **翻訳データの登録機能を実装 (SQLite)** | 翻訳・要約データを `translation_collection` に登録 | `src/sqlite/translationHandler.ts` | `.roo/docs/database.md` | ⏳ |
| 8  |                          | **ベクトルデータの登録機能を実装 (Qdrant)** | 段落単位で `vector_collection` にベクトルデータを登録 | `src/qdrant/vectorHandler.ts` | `.roo/docs/database.md` | ⏳ |
| 9  | **データの整合性検証**    | **データ登録の整合性チェック** | `file_tree_collection.resource_id` と `translation_collection.resource_id`、`vector_collection.resource_id` のマッピングを検証 | `src/qdrant/dataValidator.ts` | `.roo/docs/database.md` | ⏳ |
| 10 | **ユニットテスト**        | **SQLite のデータ登録テストを実装** | `file_tree_collection` & `translation_collection` の登録テスト | `tests/sqliteTest.ts` | `.roo/docs/database.md` | ⏳ |
| 11 |                          | **Qdrant のデータ登録テストを実装** | `vector_collection` の登録テスト | `tests/qdrantTest.ts` | `.roo/docs/database.md` | ⏳ |
| 12 | **ファイルツリー検索**    | **ドメイン指定でファイルツリーを検索 (SQLite)** | `domain` をキーに `file_tree_collection` を取得 | `src/sqlite/fileTreeSearch.ts` | `.roo/docs/database.md` | ⏳ |
| 13 | **翻訳データ検索**      | **リソース ID 指定で翻訳データを取得 (SQLite)** | `resource_id` をキーに `translation_collection` から取得 | `src/sqlite/translationSearch.ts` | `.roo/docs/database.md` | ⏳ |
| 14 | **ベクトル検索**        | **類似データ検索 (Qdrant)** | `vector` を用いた類似検索を実装 | `src/qdrant/vectorSearch.ts` | `.roo/docs/database.md` | ⏳ |
| 15 |                          | **ベクトル検索時のフィルタリングを実装 (Qdrant)** | `language` をフィルタして類似検索 | `src/qdrant/vectorSearch.ts` | `.roo/docs/database.md` | ⏳ |
| 16 | **パフォーマンス検証**  | **SQLite の検索性能テストを実施** | インデックスの最適化とクエリ速度測定 | `tests/sqliteSearchTest.ts` | `.roo/docs/database.md` | 保留 |
| 17 |                          | **Qdrant の検索性能テストを実施** | 大量データでの検索速度・精度を検証 | `tests/qdrantSearchTest.ts` | `.roo/docs/database.md` | 保留 |
| 18 | **バッチ処理**          | **データ登録を 50 件単位で実施** | 一定件数ごとに SQLite & Qdrant へ登録 | `src/qdrant/batchProcessor.ts` | `.roo/docs/database.md` | ⏳ |
| 19 | **エラーハンドリング**   | **SQLite のトランザクション処理を実装** | データ登録時に `BEGIN TRANSACTION` を適用 | `src/sqlite/errorHandler.ts` | `.roo/docs/database.md` | ⏳ |
| 20 |                          | **Qdrant のエラーハンドリングを実装** | Qdrant API 接続エラー時にリトライ | `src/qdrant/errorHandler.ts` | `.roo/docs/database.md` | ⏳ |
| 21 | **統合テスト**          | **データ登録・検索の統合テストを実施** | 事前登録データを用いた E2E テスト | `tests/integrationTest.ts` | `.roo/docs/database.md` | 保留 |
| 22 | **負荷テスト**          | **大量データでの検索負荷テスト** | 1M レコードでの検索速度を測定 | `tests/loadTest.ts` | `.roo/docs/database.md` | 保留 |
| 23 | **ドキュメント**        | **SQLite + Qdrant API 仕様書を作成** | データ登録・検索・エラーハンドリングの仕様をまとめる | `docs/qdrantAPI.md` | `.roo/docs/database.md` | ⏳ |
| 24 | **運用マニュアル**      | **運用フロー・監視方法のドキュメント化** | 障害対応手順・モニタリング方針の策定 | `docs/qdrantOps.md` | `.roo/docs/database.md` | ⏳ |

---
