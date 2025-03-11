# 決定ログ

## 2025/03/09 Webページのクロール処理の返り値の変更

- 決定事項: `crawlPage`関数の返り値を`string[]`から`CrawledPage[]`に変更する
- 理由: サイト構造を維持した形で出力するため
- 背景: これまで、`crawlPage`関数はクロールしたURLのリストを返していたが、サイト構造を表現できていなかった

## 2025/03/09 `crawler.ts` のテスト作成の優先

- 決定事項: Google Gemini APIのレートリミット制御の実装の前に、`crawler.ts` のテストを作成する
- 理由: `crawler.ts` の動作をより確実に検証するため
- 背景: `crawler.ts` はWebページをクロールする重要なコンポーネントであり、テストによる検証が不可欠である

## 2025/03/09 HTML → Markdown変換ライブラリの選定

- 決定事項: HTML → Markdown変換に Turndown を使用する
- 理由: TypeScript で記述されており、導入が容易であるため
- 背景: HTML → Markdown変換ライブラリとして、Turndown、Jsoup (Java)、Pandoc が候補として挙げられていた
- ユーザー確認: Turndown で問題ないことを確認済み