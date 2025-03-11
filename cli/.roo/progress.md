# 進捗状況

### **📌 マイルストーン 1: CLI (`translate-docs`) の基本機能実装（詳細タスク分割 + カテゴリ + 進捗管理 + シーケンス番号）**

| **#** | **カテゴリ**          | **タスク** | **詳細** | **実装対象ファイル** | **進捗** |
|----|------------------|------------------------------------------|---------------------------|----------------|------|
| 1  | **CLI エントリーポイント** | **CLI のエントリーポイント実装** | `translate-docs` の CLI コマンドを作成 | `cli.ts` | ✅ |
| 2  |                   | **コマンドライン引数のパース** | `--url` / `--input` などのオプション処理 | `cli.ts` | ✅ |
| 3  | **Webページの解析**  | 指定した URL から HTML を取得する | | `src/crawler/crawler.ts` `src/crawler/htmlUtils.ts` `src/crawler/linkProcessor.ts` `src/crawler/urlUtils.ts` | ✅ |
| 4  |                   | `fetch` フラグを考慮して取得対象を判定する | | `crawler.ts` | ✅ |
| 5  |                   | **サイトマップを作成する（新規）** | | `fileWriter.ts` | ✅ |
| 6  |                   | - **ページ内のリンクを抽出** | | `src/crawler/crawler.ts` | ✅ |
| 7  |                   | - **サイトマップデータを JSON に保存** | | `src/fileWriter.ts` | ✅ |
| 8  |                   | - **探索深度 (`--depth`) を適用** | | `crawler.ts` | ✅ |
| 9  |                   | - **同一ドメインのみを対象にする** | | `src/crawler/crawler.ts` | ✅ |
| 10 |                   | - **許可ドメイン (`--allow-domains`) を考慮** | | `src/crawler/crawler.ts` | ✅ |
| 11 |                   | - **サイトマップ内での出現順を記録する** | | `src/sorter.ts` | ✅ |
| 12 |                   | - **URL を絶対パスに統一する** | | `src/crawler/crawler.ts` | ✅ |
| 13 |                   | - **サイトマップの並び順を調整する** | | `src/sorter.ts` | ✅ |
| 14 |                   | - **ディレクトリ単位でグループ化** | | `sorter.ts` | ✅ |
| 15 |                   | - **グループ内の順番は取得順を維持する** | | `sorter.ts` | ✅ |
| 16 |                   | - **サイトマップの JSON 出力フォーマットを統一** | | `src/fileWriter.ts` | ✅ |
| 17 | **HTML の取得**    | `fetch: true` のページの HTML を取得する | | `src/crawler/crawler.ts` | ✅ |
| 18 |                   | 取得した HTML を `output/sample.com/html/` に保存 | | `src/fileWriter.ts` | ✅ |
| 19 |                   | **キャッシュを活用して不要な取得を防ぐ**（新規） | | `src/crawler/crawler.ts` | ✅ |
| 20 |                   | - **HTML ファイルが既に存在する場合は取得しない** | | `src/crawler/crawler.ts` | ✅ |
| 21 |                   | - **`--force-fetch` オプション時は再取得** | | `src/crawler/crawler.ts` | ✅ |

### **📌 マイルストーン 1.5: HTML を Markdown に変換し、翻訳・要約を実施（更新後）**

| **#** | **カテゴリ**            | **タスク** | **詳細** | **実装対象ファイル** | **進捗** |
|----|------------------|------------------------------------------|---------------------------|----------------|------|
| 1  | **HTML 解析**    | **ダウンロードした HTML を読み込む** | `output/sample.com/html/` 内の HTML を読み込む | `src/parser/parser.ts` | ✅ |
| 2  |                  | **HTML を DOM にパースする** | `cheerio` などを使用して DOM ツリーを解析 | `src/parser/parser.ts` | ✅ |
| 3  |                  | **不要なスクリプト・スタイルを除外** | `script` / `style` タグを削除 | `src/parser/parser.ts` | ✅ |
| 4  |                  | **本文テキストを抽出する** | `main`, `article`, `p`, `h1~h6` などの要素を対象にテキストを取得 |  | ❌ (対応しない) |
| 5  | **Markdown 変換** | **HTML を Markdown に変換** | `turndown` などを利用して Markdown に変換 | `src/parser/markdownFormatter.ts` | ✅ |
| 6  |                  | **リスト・表・コードブロックを適切に処理** | `ul`, `ol`, `table`, `pre` などを Markdown の書式に変換 | `src/parser/markdownFormatter.ts` | ✅ |
| 7  |                  | **Markdown のフォーマットを統一** | インデント・改行のルールを統一する | `src/parser/markdownFormatter.ts` | ✅ |
| 8  | **ファイル出力**  | **Markdown を `output/sample.com/markdown/` に保存** | | `src/fileWriter.ts` | ✅ |
| 9  | **レート制限・リトライ機能** | **Google Gemini API のレートリミット制御を実装** | **Bottleneck を利用し、リクエスト間隔を管理** | `src/utils/rateLimiter.ts` | ✅ |
| 10 |                   | **翻訳 API・要約 API のリトライ処理を実装** | **エラーハンドリング & バックオフ制御を組み込む** | `src/utils/apiRetry.ts` | ✅ |
| 11 | **翻訳処理**      | **Markdown を翻訳対象として読み込む** | | `src/translator.ts` | ⏳ |
| 12 |                  | **Google Gemini API を使用して翻訳を実施** | | `src/translator.ts` | ⏳ |
| 13 |                  | **翻訳結果を `output/sample.com/translation/` に保存** | | `src/fileWriter.ts` | ⏳ |
| 14 | **要約処理**      | **Markdown を要約対象として読み込む** | | `src/summarizer.ts` | ⏳ |
| 15 |                  | **Google Gemini API を使用して要約を実施** | | `src/summarizer.ts` | ⏳ |
| 16 |                  | **要約結果を `output/sample.com/summary/` に保存** | | `src/fileWriter.ts` | ⏳ |
| 17 | **エラーハンドリング** | **HTML のパースエラーを処理** | | `src/parser/parser.ts` | ⏳ |
| 18 |                  | **翻訳 API のエラーを処理** | | `src/translator.ts` | ⏳ |
| 19 |                  | **要約 API のエラーを処理** | | `src/summarizer.ts` | ⏳ |
| 20 | **ログ出力**      | **処理結果のログを `logs/` に出力** | | `src/logger.ts` | ⏳ |

---