export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthSession {
  user: User;
  session: Session;
}

export interface Document {
  id: string;
  user_id?: string;
  filename: string;
  page_count?: number;
  chunk_count?: number;
  status?: "PROCESSING" | "READY" | "FAILED";
  created_at: string;
}

export interface Citation {
  page_number?: number;
  page?: number;
  content?: string;
  source?: string;
  [key: string]: unknown;
}

export interface MessageResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[] | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  document_id?: string;
  created_at: string;
  messages?: MessageResponse[];
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[] | null;
  created_at?: string;
}

export interface ChatResponse {
  conversation_id: string;
  answer: string;
  sources?: Citation[];
}
