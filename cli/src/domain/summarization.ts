

// 分析結果の型定義
export interface SummarizationResult {
  noises: string[];
  claims: {
    text: string;
    source?: string;
    evidence: string;
    certainty: string;
  }[];
  claimValidation: {
    claim: string;
    relevance: string;
    insights: string[];
    suggestions: string[];
  }[],
  summary: string;
  title: string;
  keywords: string[];
  description: string;
}
