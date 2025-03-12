import fs from 'fs';
import path from 'path';

const logDirectory = 'logs';

// ログディレクトリが存在しない場合は作成
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logFilePath = path.join(logDirectory, 'app.log');

// ログレベルを定義
type LogLevel = 'info' | 'warn' | 'error';

// ログ出力関数
const log = (level: LogLevel, message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

  // コンソールに出力
  console.log(logMessage);

  // ファイルに出力
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('ログファイルへの書き込みエラー:', err);
    }
  });
};

// 各ログレベルの関数を定義
export const logger = {
  info: (message: string) => log('info', message),
  warn: (message: string) => log('warn', message),
  error: (message: string) => log('error', message),
};