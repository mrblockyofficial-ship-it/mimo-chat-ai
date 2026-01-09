export enum Role {
  User = 'user',
  Assistant = 'assistant',
  System = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface ChatSettings {
  webSearchEnabled: boolean; // Local state usually, but can be global
  turboMode: boolean;
  soundEnabled: boolean;
}

export type StreamChunk = {
  id: string;
  choices: {
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }[];
};