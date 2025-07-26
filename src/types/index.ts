export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  image?: string; // 图片URI，用于显示
  imageBase64?: string; // 图片base64，用于API
  imageMimeType?: string; // 图片MIME类型
  excludeFromContext?: boolean; // 是否从上下文中排除
  groupId?: string; // 所属聊天组ID
  isContextSeparator?: boolean; // 是否为上下文分隔符
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessage?: string;
  lastMessageTime?: number;
}

export interface ChatConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface AppState {
  messages: Message[];
  chatGroups: ChatGroup[];
  currentGroupId: string | null;
  config: ChatConfig;
  isLoading: boolean;
  error: string | null;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIRequest {
  model: string;
  messages: {
    role: string;
    content: string | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }[];
  max_tokens?: number;
  temperature?: number;
}

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
}
