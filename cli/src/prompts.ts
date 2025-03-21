export const translatePrompt = (language: string, text: string) =>
    `Translate the following text to ${language}: ${text}`;

export const summarizePrompt = (text: string) =>
    `Summarize the following text: ${text}`;