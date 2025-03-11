### **📌 仕様の修正（`fetch` フラグを追加）**
サイトマップ (`sitemap.json`) に `fetch` フラグを追加し、**リンク先のHTMLを取得するかどうかを明示的に管理** する。

---

### **📌 `fetch` フラグの仕様**
- **`fetch: true`** → **HTMLを取得 & Markdown化**
- **`fetch: false`** → **HTMLを取得せず、リンク情報のみ記録**

#### **📌 `depth=1` の場合**
- **トップページのHTMLのみ取得 (`fetch: true`)**
- **リンク先のページは取得しない (`fetch: false`)**

```json
[
  { "url": "https://sample.com", "title": "Home", "fetch": true },
  { "url": "https://sample.com/docs", "title": "Docs", "fetch": false },
  { "url": "https://sample.com/about", "title": "About Us", "fetch": false }
]
```

---

#### **📌 `depth=3` の場合**
- **最大3回までリンクをたどり、HTMLを取得**
- **深度4以降のページは取得せず、リンク情報のみ記録 (`fetch: false`)**

```json
[
  { "url": "https://sample.com", "title": "Home", "fetch": true },
  { "url": "https://sample.com/docs", "title": "Docs", "fetch": true },
  { "url": "https://sample.com/docs/getting-started", "title": "Getting Started", "fetch": true },
  { "url": "https://sample.com/docs/getting-started/details", "title": "Details", "fetch": false }
]
```

---

### **📌 変更後の処理フロー**
1. **サイトマップを作成**
   - `depth=1` の場合は `fetch: false` のリンクのみを記録
   - `depth>1` の場合は `fetch: true` のリンクを最大 `depth` レベルまで記録
2. **HTMLの取得**
   - `fetch: true` のURLに対してのみ HTML を取得
   - `fetch: false` のURLは記録のみ（Markdown化しない）

---

### **📌 期待される動作**
| depth | HTML取得の対象 | fetch: true の範囲 |
|---|---|---|
| `depth=1` | トップページのみ | トップページのみ |
| `depth=2` | トップページ + そのリンク先 | 2階層目まで |
| `depth=3` | トップページ + そのリンク先 + さらにその先 | 3階層目まで |

---

### **📌 仕様のメリット**
✅ **サイトマップにはすべてのリンク情報を記録しつつ、取得対象を制御できる**  
✅ **取得対象を減らすことで、処理時間を短縮可能**  
✅ **`fetch: false` にすることで、HTML取得を行わず、サイト構造のみ把握できる**  
