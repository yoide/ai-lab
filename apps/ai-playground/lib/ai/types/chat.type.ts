import { type Message } from '../models/message';

export type ChatRequest = {
  messages: Message[];
};

export type StreamRequest = {
  model: string;
  messages: Message[];
};
