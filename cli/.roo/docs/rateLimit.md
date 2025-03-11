
## ** 設計 (`rateLimiter.ts`)**
- **リクエスト間隔は 4000ms（4秒）** に固定
- **翻訳 (`translator.ts`) とサマリー (`summarizer.ts`) の両方に適用**
- **リクエストが制限を超える場合は待機**
- **`rateLimitedRequest(fn, args...)` を使えば、どこからでもレートリミットを適用できる**

---

### **💻 `rateLimiter.ts`（トークンバケット方式）**
```typescript
import Bottleneck from "bottleneck";

// 1分間に15回の制限 = 4秒（4000ms）間隔
const limiter = new Bottleneck({
  minTime: 4000,  // 4000ms（4秒）ごとに1リクエスト
  maxConcurrent: 1, // 同時実行は1件のみ
});

/**
 * APIリクエストをレートリミット付きで実行
 * @param fn APIリクエスト関数（非同期）
 * @param args 関数に渡す引数
 */
export async function rateLimitedRequest<T>(fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
  return limiter.schedule(() => fn(...args));
}
```

---

### **✅ `translator.ts` / `summarizer.ts` での使用**
```typescript
import { rateLimitedRequest } from "./rateLimiter";

async function translateText(text: string) {
  return rateLimitedRequest(callGeminiAPI, text);
}

async function summarizeText(text: string) {
  return rateLimitedRequest(callGeminiAPI, text);
}
```

---

## **🚀 期待される動作**
✅ **翻訳（`translator.ts`）とサマリー（`summarizer.ts`）のリクエストを統一管理**  
✅ **リクエストが多くても、4000ms（4秒）間隔で処理される**  
✅ **Gemini API の制限を超えないように確実に制御される**  
