現在のタスク：マイルストーン2のタスクを整理すること。

現状：
*   マイルストーン1のタスクは完了。
*   マイルストーン2のタスクは未整理。
*   マイルストーン1.5のタスクを順番通りに進めることになった。

次にやること：
*   マイルストーン1.5の8番目のタスクである「ファイル出力 - Markdown を `output/sample.com/markdown/` に保存」を実装する。
    *   HTML ファイルのパスの取得
        *   **`sitemap.json` から、HTML ファイルのパスを取得する。**
        *   `sitemap.json` はマイルストーン1で出力されている。
        *   `sitemap.json` のパスは `output/{domain}/sitemap.json` である。
        *   `getHtmlFilePathsFromSitemap(sitemapPath: string): string[]` のような関数を定義する。
            *   引数: `sitemap.json` のパス
            *   返り値: HTML ファイルのパスの配列
        *   **`getHtmlFilePathsFromSitemap` 関数を実装した。**
    *   HTML ファイルの読み込み
        *   Node.js の `fs` モジュールを使用して、HTML ファイルを読み込む。
        *   ファイルのエンコーディングは UTF-8 を使用する。
        *   エラーハンドリング
        *   ファイルが存在しない場合や、読み込みに失敗した場合のエラーハンドリングを実装する。
        *   JSON のパースに失敗した場合のエラーハンドリングを実装する。
        *   **`readHtmlFiles(url: string): Promise<string[]>` のような関数を定義する。**
        *   引数: CLI 引数として渡される URL
        *   返り値: HTML ファイルの内容の配列
        *   `getHtmlFilePathsFromSitemap` 関数を使用して、`sitemap.json` から HTML ファイルのパスを取得する。
        *   取得した HTML ファイルのパスを元に、Node.js の `fs` モジュールを使用して HTML ファイルを読み込む。
        *   ファイルのエンコーディングは UTF-8 を使用する。
        *   `getHtmlFilePathsFromSitemap` 関数が空の配列を返した場合、または HTML ファイルの読み込みに失敗した場合のエラーハンドリングを実装する。
        *   **`readHtmlFiles` 関数を実装し、動作確認が完了した。**
    *   HTML を DOM にパースする
        *   **`removeUnnecessaryTags` と `parseHtmlToDOM` を統合し、`parseHtmlToDOM` 関数内で不要なタグを削除するように修正した。**
        *   `parseHtmlToDOM(html: string): CheerioAPI` のような関数を定義する。
            *   引数: HTML 文字列
            *   返り値: Cheerio オブジェクト
            *   `cheerio.load(html)` を呼び出す前に、`removeUnnecessaryTags` の処理を行う。
        *   HTML のパースに失敗した場合のエラーハンドリングを実装する。
        *   **`parseHtmlToDOM` 関数を実装した。**
    *   ~~本文テキストを抽出する~~
        *   ~~`cheerio` を使用して、DOM から本文テキストを抽出する。~~
        *   ~~DOM 全体からテキストを抽出する。~~
        *   ~~画像やリンクも動作する形で利用できるように、テキストを抽出する際に、画像やリンクの情報を保持する。~~
        *   ~~抽出したテキストから、不要な空白や改行を削除する。~~
        *   ~~連続する空白を1つにまとめ、行頭・行末の空白を削除する。~~
        *   `extractTextFromDOM(dom: CheerioAPI): string` のような関数を定義する。
            *   ~~引数: Cheerio オブジェクト~~
            *   ~~返り値: 抽出された本文テキスト~~
            *   DOM が存在しない場合や、テキストの抽出に失敗した場合のエラーハンドリングを実装する。
        *   **`extractTextFromDOM` 関数は使用しない。**
    *   HTML を Markdown に変換
        *   **`htmlToMarkdown` 関数の引数を HTML 文字列から Cheerio オブジェクトに変更し、動作確認が完了した。**
        *   **`convertMarkdownFormat` 関数内で、`turndown` サービスを使用して Markdown 変換を行う際に、リスト・表・コードブロックが適切に処理されるように、`turndown` サービスのオプションを調整し、画像とリンクの処理も行うように修正した。**
        *   **`turndown-plugin-gfm` を使用して、Markdown 変換の機能を拡張した。**
        *   **リスト・表・コードブロックが適切に処理されるように、`turndown` サービスのオプションを調整し、画像とリンクの処理も行うように修正した。テストも実装し、動作確認が完了した。**
    *   Markdown のフォーマットを統一
        *   Markdown のインデントや改行のルールを統一する。
        *   これらのルールは、`.roo/docs/markdownFormatter.md` のようなファイルに記述しておくと、後で参照しやすくなる。
        *   Markdown のフォーマット処理を実装する。
        *   この処理は、`src/parser/markdownFormatter.ts` に実装する。
        *   正規表現などを使用して、Markdown のテキストを修正する。
        *   エラーハンドリング
        *   Markdown のフォーマット処理に失敗した場合のエラーハンドリングを実装する。
        *   `formatMarkdown(markdown: string): string` のような関数を定義する。
            *   引数: Markdown テキスト
            *   返り値: フォーマット済みの Markdown テキスト
        *   **`formatMarkdown` 関数を実装し、動作確認が完了した。**
    *   ファイル出力
        *   `output/sample.com/markdown/` ディレクトリが存在しない場合は、作成する。
        *   Node.js の `fs.mkdirSync` 関数を使用する。
        *   `recursive: true` オプションを指定することで、親ディレクトリが存在しない場合でも再帰的にディレクトリを作成できる。
        *   HTML ファイル名に対応する Markdown ファイル名を決定する。
        *   例えば、`output/sample.com/html/path/to/page.html` に対応する Markdown ファイルは、`output/sample.com/markdown/path/to/page.md` となる。
        *   Node.js の `fs.writeFileSync` 関数を使用して、Markdown ファイルを書き込む。
        *   ファイルのエンコーディングは UTF-8 を使用する。
        *   ディレクトリの作成に失敗した場合や、ファイルの書き込みに失敗した場合のエラーハンドリングを実装する。
        *   `saveMarkdownToFile(markdown: string, url: string): Promise<void>` のような関数を定義する。
            *   引数1: Markdown テキスト
            *   引数2: 元の URL
            *   返り値: なし
        *   **`saveMarkdownToFile` 関数を実装した。**
    *   **`README.md` を更新し、以下の点を修正する。**
        *   **`--force-fetch` オプションを追記する。**
        *   **`input` コマンドの説明を修正する。**
        *   **出力先のディレクトリ構成について説明を追加する。**
    *   実装対象ファイル: `src/fileWriter.ts`、`README.md`
