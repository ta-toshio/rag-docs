import { sortByDirectory } from './sorter';
import { SitemapEntry } from './crawler/types';
import { describe, expect, it } from 'vitest';

describe('sortByDirectory', () => {
  // 1. entriesが空の場合は空配列を返す
  it('returns an empty array when input is empty', () => {
    const result = sortByDirectory([], "https://sample.com/docs/");
    expect(result).toEqual([]);
  });

  // 2. 異なるオリジンのエントリは除外せず、後ろに配置される
  it('handles entries with a different origin by placing them after root entries', () => {
    const entries: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
      { url: "https://another.com/docs/installation", title: "Other Installation", fetch: true },
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    const expected: SitemapEntry[] = [
      // ルートURL該当エントリが先頭
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
      // ルートURL外のエントリが後ろに入力順そのまま
      { url: "https://another.com/docs/installation", title: "Other Installation", fetch: true },
    ];
    expect(result).toEqual(expected);
  });

  // 3. ルートパス以外のパス（同一オリジン内）は後ろに配置される
  it('handles entries not under the root path by placing them after root entries', () => {
    const entries: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
      { url: "https://sample.com/other/installation", title: "Other Installation", fetch: true },
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    const expected: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
      { url: "https://sample.com/other/installation", title: "Other Installation", fetch: true },
    ];
    expect(result).toEqual(expected);
  });

  // 4. ルート直下の直接エントリが1件の場合
  it('handles a single direct entry under the root', () => {
    const entries: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    expect(result).toEqual(entries);
  });

  // 5. ルートURLそのもののエントリも直接エントリとして扱う
  it('handles an entry for the root URL itself', () => {
    const entry: SitemapEntry = { url: "https://sample.com/docs/", title: "Docs Home", fetch: true };
    const entries: SitemapEntry[] = [ entry ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    expect(result).toEqual(entries);
  });

  // 6. 複数の直接エントリが入力順序のまま返る
  it('handles multiple direct entries preserving the input order', () => {
    const entries: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
      { url: "https://sample.com/docs/getting-started", title: "Getting Started", fetch: true },
      { url: "https://sample.com/docs/advanced", title: "Advanced", fetch: false },
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    expect(result).toEqual(entries);
  });

  // 7. ルート直下のエントリと、サブディレクトリに属するエントリを混在させた場合のグループ分け
  it('groups entries with subfolders correctly', () => {
    const entries: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },   // direct (index 0)
      { url: "https://sample.com/docs/me/hoge", title: "Hoge", fetch: true },                 // group "me" (index 1)
      { url: "https://sample.com/docs/getting-started", title: "Getting Started", fetch: true },// direct (index 2)
      { url: "https://sample.com/docs/me/fuga", title: "Fuga", fetch: true },                   // group "me" (index 3)
      { url: "https://sample.com/docs/advanced", title: "Advanced", fetch: false },             // direct (index 4)
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    const expected: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
      { url: "https://sample.com/docs/me/hoge", title: "Hoge", fetch: true },
      { url: "https://sample.com/docs/me/fuga", title: "Fuga", fetch: true },
      { url: "https://sample.com/docs/getting-started", title: "Getting Started", fetch: true },
      { url: "https://sample.com/docs/advanced", title: "Advanced", fetch: false },
    ];
    expect(result).toEqual(expected);
  });

  // 8. 同一グループ内で元の出現順が保持されることの確認
  it('maintains the original order within the same group', () => {
    const entries: SitemapEntry[] = [
      // 入力順: fuga が先、hoge が後
      { url: "https://sample.com/docs/me/fuga", title: "Fuga", fetch: true },
      { url: "https://sample.com/docs/me/hoge", title: "Hoge", fetch: true },
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    expect(result).toEqual(entries);
  });

  // 9. 複数の直接エントリとサブディレクトリエントリが混在し、出現順にグループ間の順序が維持されること
  it('handles entries with mixed direct and grouped items with interleaved order', () => {
    const entries: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },    // direct (index 0)
      { url: "https://sample.com/docs/me/hoge", title: "Hoge", fetch: true },                  // group "me" (index 1)
      { url: "https://sample.com/docs/getting-started", title: "Getting Started", fetch: true }, // direct (index 2)
      { url: "https://sample.com/docs/me/fuga", title: "Fuga", fetch: true },                    // group "me" (index 3)
      { url: "https://sample.com/docs/advanced", title: "Advanced", fetch: false },              // direct (index 4)
      { url: "https://sample.com/docs/other/extra", title: "Extra", fetch: true },               // group "other" (index 5)
      { url: "https://sample.com/docs/other/more", title: "More", fetch: true },                 // group "other" (index 6)
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    const expected: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
      { url: "https://sample.com/docs/me/hoge", title: "Hoge", fetch: true },
      { url: "https://sample.com/docs/me/fuga", title: "Fuga", fetch: true },
      { url: "https://sample.com/docs/getting-started", title: "Getting Started", fetch: true },
      { url: "https://sample.com/docs/advanced", title: "Advanced", fetch: false },
      { url: "https://sample.com/docs/other/extra", title: "Extra", fetch: true },
      { url: "https://sample.com/docs/other/more", title: "More", fetch: true },
    ];
    expect(result).toEqual(expected);
  });

  // 10. ルートURL該当エントリと非該当エントリが混在する場合、ルートURL該当エントリが先頭に来る
  it('places root entries first and non-root entries afterwards', () => {
    const entries: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },   // root
      { url: "https://sample.com/docs/me/hoge", title: "Hoge", fetch: true },                 // root (group "me")
      { url: "https://sample.com/other/info", title: "Other Info", fetch: false },             // non-root
      { url: "https://another.com/docs/extra", title: "Extra", fetch: true },                  // non-root (different origin)
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    const expected: SitemapEntry[] = [
      // ルートURL該当エントリ
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
      { url: "https://sample.com/docs/me/hoge", title: "Hoge", fetch: true },
      // その後に非該当エントリ（入力順）
      { url: "https://sample.com/other/info", title: "Other Info", fetch: false },
      { url: "https://another.com/docs/extra", title: "Extra", fetch: true },
    ];
    expect(result).toEqual(expected);
  });

  // 11. 同一オリジン内で、ルートURL該当と非該当が混在する場合、非該当は入力順で後ろに配置される
  it('handles mixed entries from same origin with non-root entries coming after', () => {
    const entries: SitemapEntry[] = [
      { url: "https://sample.com/docs/getting-started", title: "Getting Started", fetch: true }, // root
      { url: "https://sample.com/other/info", title: "Other Info", fetch: false },                  // non-root
      { url: "https://sample.com/docs/advanced", title: "Advanced", fetch: false },                 // root
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    const expected: SitemapEntry[] = [
      // root 部分：グループ分けすると入力順に「Getting Started」→「Advanced」
      { url: "https://sample.com/docs/getting-started", title: "Getting Started", fetch: true },
      { url: "https://sample.com/docs/advanced", title: "Advanced", fetch: false },
      // 非ルート部はそのまま入力順
      { url: "https://sample.com/other/info", title: "Other Info", fetch: false },
    ];
    expect(result).toEqual(expected);
  });

  // 12. サブドメインが異なる場合も、除外せずに非ルートとして配置される
  it('handles entries from a different subdomain by placing them after root entries', () => {
    const entries: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },    // root
      { url: "https://www.sample.com/docs/info", title: "WWW Info", fetch: true },              // non-root (different subdomain)
      { url: "https://sample.com/docs/getting-started", title: "Getting Started", fetch: true }, // root
    ];
    const result = sortByDirectory(entries, "https://sample.com/docs/");
    const expected: SitemapEntry[] = [
      { url: "https://sample.com/docs/installation", title: "Installation", fetch: true },
      { url: "https://sample.com/docs/getting-started", title: "Getting Started", fetch: true },
      { url: "https://www.sample.com/docs/info", title: "WWW Info", fetch: true },
    ];
    expect(result).toEqual(expected);
  });
});
