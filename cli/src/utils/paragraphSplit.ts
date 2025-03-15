// vectorUtils.ts

/**
 * Markdown テキストを "\n\n" で分割し、
 * 各段落が200〜500文字になるように調整して返す
 */
export function splitMarkdownToParagraphs(markdown: string): string[] {
    // 改行で初期分割
    const rawBlocks = markdown.split('\n\n').map(p => p.trim()).filter(p => p.length > 0);
    const paragraphs: string[] = [];
  
    // 長すぎるブロックを分割するヘルパー関数
    function splitLongBlock(block: string): string[] {
      const chunks: string[] = [];
      let remaining = block;
      while (remaining.length > 500) {
        // 200〜500文字の範囲内で、できるだけ直近の空白で区切る
        let breakIndex = remaining.lastIndexOf(' ', 500);
        if (breakIndex === -1 || breakIndex < 200) {
          breakIndex = 500;
        }
        const chunk = remaining.substring(0, breakIndex).trim();
        chunks.push(chunk);
        remaining = remaining.substring(breakIndex).trim();
      }
      if (remaining.length > 0) {
        chunks.push(remaining);
      }
      // 最後のチャンクが200文字未満の場合、前のチャンクと結合（結合後500文字以内なら）
      if (chunks.length > 1 && chunks[chunks.length - 1].length < 200) {
        const last = chunks.pop()!;
        const prev = chunks.pop()!;
        const merged = (prev + ' ' + last).trim();
        chunks.push(merged);
      }
      return chunks;
    }
  
    let buffer = '';
    for (const block of rawBlocks) {
      if (block.length > 500) {
        // もしバッファに蓄積中のテキストがあれば先に追加
        if (buffer) {
          paragraphs.push(buffer);
          buffer = '';
        }
        // 長いブロックはさらに分割
        paragraphs.push(...splitLongBlock(block));
      } else if (block.length < 200) {
        // 短すぎる場合はバッファに蓄積
        buffer = buffer ? (buffer + ' ' + block).trim() : block;
        // バッファが200〜500文字になったら確定
        if (buffer.length >= 200 && buffer.length <= 500) {
          paragraphs.push(buffer);
          buffer = '';
        }
      } else {
        // ちょうど適正な長さならそのまま追加
        if (buffer) {
          // 既存のバッファと結合しても500文字以内なら結合
          if ((buffer + ' ' + block).trim().length <= 500) {
            buffer = (buffer + ' ' + block).trim();
            if (buffer.length >= 200) {
              paragraphs.push(buffer);
              buffer = '';
            }
          } else {
            paragraphs.push(buffer);
            paragraphs.push(block);
            buffer = '';
          }
        } else {
          paragraphs.push(block);
        }
      }
    }
    if (buffer) {
      paragraphs.push(buffer);
    }
    return paragraphs;
  }