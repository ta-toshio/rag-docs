import { SitemapEntry } from './types';

/**
 * entries の中から、rootUrl（例: "https://sample.com/docs/"）以下のエントリをグループ化して並び替え、
 * その後、rootUrl に該当しないエントリを入力順（安定ソート）で後ろに付加して返す。
 */
export function sortByDirectory(entries: SitemapEntry[], rootUrl: string): SitemapEntry[] {
  type GroupItem = { entry: SitemapEntry; index: number };
  type Group = { key: string; minIndex: number; items: GroupItem[] };

  const groups: Group[] = [];
  const groupMap = new Map<string, Group>();
  const nonRootEntries: { entry: SitemapEntry; index: number }[] = [];

  // ルートURLをパース。末尾 "/" の有無を統一する。
  const rootUrlObj = new URL(rootUrl);
  const basePath = rootUrlObj.pathname.endsWith('/') ? rootUrlObj.pathname : rootUrlObj.pathname + '/';

  entries.forEach((entry, index) => {
    const urlObj = new URL(entry.url);
    // ルートURLと同じオリジンかつ、パスが basePath から始まる場合はグループAに振り分け
    if (urlObj.origin === rootUrlObj.origin && urlObj.pathname.startsWith(basePath)) {
      // ルート部分を除いた相対パス（例: "/docs/me/hoge" → "me/hoge"）
      const relativePath = urlObj.pathname.slice(basePath.length);
      const segments = relativePath.split('/').filter(s => s.length > 0);
      let groupKey: string;
      if (segments.length > 0) {
        if (segments.length >= 2) {
          // サブディレクトリがある場合は、最初のセグメントでグループ化（例："me"）
          groupKey = `group_${segments[0]}`;
        } else {
          // ルート直下のエントリは個別グループとする
          groupKey = `direct_${index}`; // ユニークキーとする
        }
      } else {
        // ルートURLそのものの場合
        groupKey = `direct_${index}`;
      }
      if (groupMap.has(groupKey)) {
        const group = groupMap.get(groupKey)!;
        group.items.push({ entry, index });
        group.minIndex = Math.min(group.minIndex, index);
      } else {
        const newGroup: Group = { key: groupKey, minIndex: index, items: [{ entry, index }] };
        groups.push(newGroup);
        groupMap.set(groupKey, newGroup);
      }
    } else {
      // ルートURL以外のエントリは nonRootEntries に格納（入力順を保持）
      nonRootEntries.push({ entry, index });
    }
  });

  // Group A（ルートURL該当エントリ）は、各グループの最初の出現順で並び替え
  groups.sort((a, b) => a.minIndex - b.minIndex);
  const sortedGroupA: SitemapEntry[] = [];
  groups.forEach(group => {
    group.items.sort((a, b) => a.index - b.index);
    group.items.forEach(item => sortedGroupA.push(item.entry));
  });

  // nonRootEntries は入力順でそのまま
  nonRootEntries.sort((a, b) => a.index - b.index);
  const sortedGroupB = nonRootEntries.map(item => item.entry);

  // ルートURL該当エントリを先頭、その他をその後に連結して返す
  return [...sortedGroupA, ...sortedGroupB];
}

