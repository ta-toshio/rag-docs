# **サイトマップ生成・HTML並列取得に関する要件定義書**

## **1. 基本情報**
- **機能名称**: Webページのサイトマップ生成およびHTMLの取得
- **対象モジュール**: `crawler.ts`, `fileWriter.ts`
- **関連機能**: CLI (`translate-docs`)

---

## **2. 機能概要**
本機能では、指定した URL からリンクを解析し、サイトマップを作成する。  
作成されたサイトマップを基に、**HTML を取得し、ローカルに保存する**。  
また、**出現順を完全に維持しつつ、ディレクトリ単位でグループ化して並び替える**。  

さらに、**リンク先のHTMLを取得するかどうかを `fetch` フラグで制御し、キャッシュを活用することで不要なHTMLの再取得を回避する**。

---

## **3. 機能要件**
### **3.1 サイトマップの作成**
- **対象 URL (`--url`) から内部リンクを探索し、サイトマップを作成する**
- **サイトマップの構造**
    ```json
    [
      {
        "url": "https://sample.com/docs/getting-started",
        "title": "Getting Started",
        "fetch": true
      },
      {
        "url": "https://sample.com/docs/installation",
        "title": "Installation",
        "fetch": false
      }
    ]
    ```
- **探索対象**
  - `a` タグ (`<a href="...">`)
  - **同一ドメインのみを対象**（オプション `--allow-domains` で許可ドメインを追加可能）
  - **相対パスは絶対URLに変換**
- **探索階層**
  - `--depth` に指定された階層までリンクを再帰的にたどる
  - **`fetch` フラグを設定**
    - **`fetch: true`** → HTMLを取得 & 保存
    - **`fetch: false`** → HTMLを取得せず、リンク情報のみ記録
- **出現順の記録**
  - **ページ内でリンクが出現した順番を記録**
  - `Array<{url: string, title: string, order: number}>` のように順番情報を保持

---

### **3.2 HTML の取得**
- **サイトマップを基に `fetch: true` のページの HTML を取得**
  - `fetch: false` のページは記録のみ（HTML保存なし）
- **HTML の取得方法**
  - `axios.get(url)` を使用
  - **User-Agent を設定してボットブロック回避**
- **取得した HTML のキャッシュ**
  - **`output/sample.com/html/` にHTMLを保存**
  - **次回以降の実行時、キャッシュが存在する場合は再取得せずキャッシュを使用**
  - キャッシュの保存形式:
    ```
    output/
      sample.com/
        html/
          docs/
            getting-started.html
    ```
  - **オプション `--force-fetch` を指定した場合、キャッシュを無視して強制的にHTMLを再取得する**
- **HTML の保存方法**
  - **URL のパス情報を利用してフォルダで区切って出力**
  - **ファイル名はエンコードせず、そのままページ名を使用**
  - 例:
    - `https://sample.com/docs/getting-started` → `output/sample.com/html/docs/getting-started.html`
    - `https://sample.com/blog/news` → `output/sample.com/html/blog/news.html`

---

### **3.3 並び順の調整**

#### **3.3.1 基本ルール**
- **ルートURLに基づいたグループ化を行う**
  - ルートURL (`rootUrl`) を基準とし、それ以下のエントリを「ルートURL該当エントリ」として扱う。
  - 例: ルートURLが `https://sample.com/docs/` の場合、`https://sample.com/docs/installation` や `https://sample.com/docs/me/hoge` はルートURL該当エントリ。
- **ルートURLに該当するエントリは先頭に配置する**
  - ルートURL以下のエントリはディレクトリ単位でグループ化し、取得順を保持した上で並べる。
  - ルートURLに該当しないエントリ（別のオリジン・異なるサブディレクトリなど）は、取得順を保持したまま後ろに配置する。

#### **3.3.2 ルートURL該当エントリの並び順**
- **ディレクトリ単位でグループ化**
  - **URLのパス構造に基づいて、同じ親ディレクトリ内のエントリをまとめる**
  - 例: `/docs/me/hoge`, `/docs/me/fuga` は `/docs/me/` にまとまる。
- **ディレクトリグループの順番は、出現順に従う**
  - 例: `/docs/installation` が `/docs/me/hoge` より先に取得されていたら、`/docs/installation` を前に配置。
- **グループ内の順番は出現順を保持**
  - `/docs/me/hoge` と `/docs/me/fuga` が `/docs/me/` に属する場合、取得された順番を維持する。
- **フォルダ構成・ファイル名の変更はなし**
  - 変更するのは **サイトマップ内の並び順のみ**。
  - HTML の出力先フォルダ (`output/sample.com/html/`) は URL のパス構造をそのまま反映する。

#### **3.3.3 ルートURLに該当しないエントリの扱い**
- ルートURL (`rootUrl`) に該当しないエントリ（異なるオリジン、ルートURL外のパスを持つもの）は **除外せず、取得順を保持したまま後ろに配置**。
- 例:
  - `https://sample.com/docs/installation` や `https://sample.com/docs/me/hoge` はルートURL内 → 先頭グループ。
  - `https://sample.com/blog/news` や `https://other.com/docs/page` はルートURL外 → 取得順のまま後ろに配置。

#### **3.3.4 並び替えの具体例**

##### **入力（取得順）**
```json
[
  { "url": "https://sample.com/docs/installation", "title": "Installation", "fetch": true },
  { "url": "https://sample.com/docs/me/hoge", "title": "Hoge", "fetch": true },
  { "url": "https://sample.com/docs/getting-started", "title": "Getting Started", "fetch": true },
  { "url": "https://sample.com/blog", "title": "Blog", "fetch": false },
  { "url": "https://sample.com/docs/me/fuga", "title": "Fuga", "fetch": true },
  { "url": "https://other.com/docs/page", "title": "Other Page", "fetch": false },
  { "url": "https://sample.com/docs/advanced", "title": "Advanced", "fetch": false }
]
```

##### **並び替え後**
```json
[
  { "url": "https://sample.com/docs/installation", "title": "Installation", "fetch": true },
  { "url": "https://sample.com/docs/me/hoge", "title": "Hoge", "fetch": true },
  { "url": "https://sample.com/docs/me/fuga", "title": "Fuga", "fetch": true },
  { "url": "https://sample.com/docs/getting-started", "title": "Getting Started", "fetch": true },
  { "url": "https://sample.com/docs/advanced", "title": "Advanced", "fetch": false },
  { "url": "https://sample.com/blog", "title": "Blog", "fetch": false },
  { "url": "https://other.com/docs/page", "title": "Other Page", "fetch": false }
]
```

#### **3.3.5 例外的なケース**
- **ルートURLそのもののエントリ（例: `https://sample.com/docs/`）がある場合**
  - 最も先頭に配置する。
- **URLのオリジンが異なる場合（例: `https://other.com/docs/`）**
  - ルートURL該当エントリの後に、取得順を保持して配置する。
- **サブドメインが異なる場合（例: `https://www.sample.com/docs/`）**
  - ルートURL該当エントリの後に、取得順を保持して配置する。


---

## **4. CLI オプション**
| オプション | 説明 | デフォルト |
|---|---|---|
| `--url <URL>` | 解析対象のURL | **必須** |
| `--depth <number>` | 探索の深さ（リンクの再帰レベル） | `3` |
| `--allow-domains <domains>` | 許可する追加のドメイン（カンマ区切り） | `なし` |
| `--force-fetch` | キャッシュを無視し、HTMLを強制的に再取得 | `false` |

---

## **5. キャッシュ機能のメリット**
✅ **サイトの負荷軽減**  
✅ **処理時間の短縮**（キャッシュがある場合はHTML取得をスキップ）  
✅ **APIリクエスト数の削減**（Gemini APIやサーバー側の負荷を抑制）
