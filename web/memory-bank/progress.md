# Progress

## 📌 マイルストーン 1: ファイル管理・表示機能の実装

| **#** | **カテゴリ**          | **タスク** | **詳細** | **実装対象ファイル** | **仕様書** | **使用したモデル** | **進捗** |
|----|------------------|------------------------------------------|---------------------------|----------------|----------------|----------------|------|
| 1  | **プロジェクト設定** | **プロジェクト一覧を取得する API を実装** | `/api/projects` からプロジェクト一覧を取得 | `app/api/projects/route.ts` | `domain/project.ts` |  | 完了 |
| 2  |                  | **プロジェクト一覧をフロントエンドで取得** | `useEffect` で API を呼びセレクトボックスに表示 | `components/project-selector.tsx` | `domain/project.ts` |  | 完了 |
| 3  |                  | **プロジェクト選択時の遷移処理を実装** | `/project/${id}` に遷移 | `components/project-selector.tsx` |  |  | 完了 |
| 4  | **プロジェクト設定** | **/projects/${id} ページを作成** | プロジェクトの詳細を表示するページを作成 | `app/projects/[id]/page.tsx` |  |  | 完了 |
| 5  | **ファイル管理**  | **ファイル一覧を取得する API を実装** | `/api/projects/${id}/files` からファイルリストを取得 | `app/api/projects/[id]/files/route.ts` | `domain/fileTree.ts` |  | 完了 |
| 6  |                  | **ファイルリストをツリー表示用にデータ整形** | 階層構造を解析し、ツリー構造を生成 | `app/api/projects/[id]/files/route.ts` | `domain/fileTree.ts` |  | 完了 |
| 7  |                  | **ファイルツリーの UI を実装** | ツリー構造でファイルを表示 | `components/tree-view.tsx` |  |  | 完了 |
| 8  |                  | **フォルダの開閉機能を実装** | フォルダをクリックで開閉 | `components/tree-view.tsx` |  |  | 完了 |
| 9  |                  | **ファイル検索 API を実装** | Qdrantを使用したベクトル検索 | `server-actions/search.ts` | `.roo/docs/search.md` |  | 完了 |
| 10 |                  | **ファイル検索フォーム UI を実装** | 検索バーでファイル名を検索できるようにする | `components/search-bar.tsx` | `.roo/docs/search.md` |  | 完了 |
| 11 |                  | **ファイル検索結果 UI を実装** | 検索結果をリスト表示 | `components/search-dialog.tsx` | `.roo/docs/search.md` |  | 完了 |
| 12 | **コンテンツ表示** | **ファイルのコンテンツ取得 API を実装** | `/api/projects/${id}/files/${fileId}` で取得 |  |  |  | 着手 |
| 13 |                  | **Markdown コンテンツのプレビューを実装** | 取得したコンテンツの内容を表示 |  |  |  |  |
| 14 |                  | **開いているファイルをタブバーに追加** | 選択したファイル名をタブバーに追加 |  |  |  |  |
| 15 | **操作・ナビゲーション** | **クリックでファイルを開く処理を実装** | ファイルツリーのファイルをクリックで開く |  |  |  |  |
| 16 |                  | **フォルダの開閉状態を記憶** | 開いたフォルダの状態をローカルストレージに保存 |  |  |  |  |

## Completed Tasks

*   実装計画の作成 (implementation_plan.md)
*   Memory Bank 初期化 (activeContext.md, productContext.md)
*   検索機能の実装 (lib/qdrant.ts, lib/gemini.ts, server-actions/search.ts, components/search-bar.tsx, components/search-dialog.tsx)

## Current Tasks

*   ファイル一覧表示機能の実装

## Next Steps

* 2025-03-15 22:07:00 - ファイル一覧APIの呼び出しとTreeViewコンポーネントへの表示を実装 - 完了
* 2025-03-15 22:10:00 - フォルダの開閉状態をローカルストレージに保存する機能を実装 - 完了
* 2025-03-17 10:06:00 - 検索機能の実装計画を作成 (memory-bank/implementation-plan.md) - 完了
* 2025-03-17 10:18:00 - 検索機能の実装 - 完了
  * lib/qdrant.ts の実装
  * lib/gemini.ts の実装
  * server-actions/search.ts の実装
  * search-bar.tsx と search-dialog.tsx の更新

*   ファイル一覧APIの実装
*   ファイルツリー表示の実装