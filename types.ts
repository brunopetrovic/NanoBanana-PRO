export interface PromptState {
  subject: string;
  action: string;
  environment: string;
  shotType: string;
  angle: string;
  lighting: string;
  mood: string;
  camera: string;
  lens: string;
  filmLook: string;
  style: string;
  movieLook: string;
  effect: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  data: PromptState;
}

export interface GeneratedImage {
  url: string; // Base64 data URL
  prompt: string;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ElementReference {
  id: string;
  type: 'face' | 'outfit' | 'scene' | 'global';
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
}