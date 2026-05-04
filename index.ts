export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_active: boolean;
  rate_limit_tier: string;
  created_at: string;
}

export interface Voice {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  voice_type: string;
  language: string;
  gender?: string;
  age_group?: string;
  sample_url?: string;
  quality_score?: number;
  usage_count: number;
  is_public: boolean;
  tags: string[];
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  project_id?: string;
  voice_id: string;
  text: string;
  speed: number;
  pitch: number;
  volume: number;
  emotion: string;
  language: string;
  engine: string;
  status: string;
  audio_url?: string;
  audio_duration?: number;
  audio_format: string;
  file_size?: number;
  sample_rate: number;
  processing_time?: number;
  created_at: string;
  completed_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  language: string;
  default_voice_id?: string;
  settings: Record<string, any>;
  created_at: string;
}

export interface TTSParams {
  text: string;
  voice_id: string;
  project_id?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  emotion?: string;
  language?: string;
  ssml?: string;
  audio_format?: string;
  stream?: boolean;
}

export type Emotion = "neutral" | "happy" | "sad" | "angry" | "excited" | "whisper" | "shouting";
export type AudioFormat = "mp3" | "wav" | "ogg" | "aac";
