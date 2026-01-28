
export interface RestorationAnalysis {
  statusReport: string;
  historicalContext: string;
  restorationBlueprint: string;
  aiVisualizationPrompt: string;
}

export interface RestoredImage {
  url: string;
  prompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  VIEWING_ANALYSIS = 'VIEWING_ANALYSIS',
  RESTORING = 'RESTORING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
