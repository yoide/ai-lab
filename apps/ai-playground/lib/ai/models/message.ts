import { type MessageRole } from '../types/message-role.type';

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
};
