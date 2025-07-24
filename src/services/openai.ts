import { OpenAIRequest, OpenAIResponse, ChatConfig, ModelsResponse, ModelInfo } from '../types';

export class OpenAIService {
  private config: ChatConfig;

  constructor(config: ChatConfig) {
    this.config = config;
  }

  updateConfig(config: ChatConfig) {
    this.config = config;
  }

  /**
   * 处理Base URL，支持强制模式（#号标记）
   */
  private processBaseUrl(baseUrl: string, endpoint: string = ''): string {
    // 检查是否有强制模式标记（#号）
    if (baseUrl.includes('#')) {
      // 移除#号，直接使用用户指定的完整URL
      return baseUrl.replace('#', '');
    }

    // 正常模式：添加端点
    return baseUrl + endpoint;
  }

  async sendMessage(messages: { role: string; content: string }[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('API Key is required');
    }

    if (!this.config.baseUrl) {
      throw new Error('Base URL is required');
    }

    const requestBody: OpenAIRequest = {
      model: this.config.model || 'gpt-3.5-turbo',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    };

    try {
      // 使用处理后的URL
      const apiUrl = this.processBaseUrl(this.config.baseUrl, '/chat/completions');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorData}`);
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.sendMessage([{ role: 'user', content: 'Hello' }]);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * 智能检测和修正Base URL
   * 支持强制模式：如果URL包含#号，则直接使用用户指定的完整URL
   * 否则尝试不同的常见端点格式，找到正确的API地址
   */
  async detectAndFixBaseUrl(inputUrl: string, apiKey: string): Promise<{ baseUrl: string; isValid: boolean; detectedEndpoints: string[]; errorDetails?: string; isForceMode?: boolean }> {
    if (!apiKey.trim()) {
      throw new Error('API Key is required for detection');
    }

    if (!inputUrl.trim()) {
      throw new Error('Base URL is required for detection');
    }

    // 检查是否为强制模式（包含#号）
    const isForceMode = inputUrl.includes('#');

    if (isForceMode) {
      console.log('🔒 Force mode detected (# symbol found)');
      const forcedUrl = inputUrl.replace('#', '').trim().replace(/\/+$/, '');

      // 验证强制URL格式
      try {
        new URL(forcedUrl);
      } catch (error) {
        throw new Error('Invalid URL format in force mode. Please include https:// prefix');
      }

      // 在强制模式下，直接测试用户指定的完整URL
      return await this.testForcedUrl(forcedUrl, apiKey);
    }

    // 清理输入URL（正常模式）
    const cleanUrl = inputUrl.trim().replace(/\/+$/, ''); // 移除末尾斜杠

    // 验证URL格式
    try {
      new URL(cleanUrl);
    } catch (error) {
      throw new Error('Invalid URL format. Please include https:// prefix');
    }

    // 常见的API端点模式
    const possibleEndpoints = [
      cleanUrl + '/v1',                    // 最常见：https://api.example.com/v1
      cleanUrl,                            // 直接使用：https://api.example.com
      cleanUrl + '/api/v1',               // 有些服务：https://example.com/api/v1
      cleanUrl + '/openai/v1',            // 代理服务：https://example.com/openai/v1
      cleanUrl + '/v1/openai',            // 另一种代理：https://example.com/v1/openai
    ];

    const detectedEndpoints: string[] = [];
    let validBaseUrl = '';
    let lastError = '';

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);

        // 创建超时Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout (10s)')), 10000);
        });

        // 先测试 /models 端点（更轻量）
        const fetchPromise = fetch(`${endpoint}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        // 使用Promise.race实现超时
        const modelsResponse = await Promise.race([fetchPromise, timeoutPromise]);

        console.log(`Response status for ${endpoint}: ${modelsResponse.status}`);

        if (modelsResponse.ok) {
          try {
            const data = await modelsResponse.json();
            console.log(`Response data for ${endpoint}:`, data);

            if (data.data && Array.isArray(data.data)) {
              console.log(`✅ Valid endpoint found: ${endpoint}`);
              detectedEndpoints.push(endpoint);
              if (!validBaseUrl) {
                validBaseUrl = endpoint;
              }
            } else {
              console.log(`❌ Invalid response format for ${endpoint}`);
              lastError = `Invalid response format from ${endpoint}`;
            }
          } catch (jsonError) {
            console.log(`❌ JSON parse error for ${endpoint}:`, jsonError);
            lastError = `Invalid JSON response from ${endpoint}`;
          }
        } else {
          const errorText = await modelsResponse.text().catch(() => 'Unknown error');
          console.log(`❌ HTTP error for ${endpoint}: ${modelsResponse.status} - ${errorText}`);
          lastError = `HTTP ${modelsResponse.status}: ${errorText}`;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ Endpoint ${endpoint} failed:`, errorMessage);
        lastError = errorMessage;
      }
    }

    console.log(`Detection completed. Found ${detectedEndpoints.length} valid endpoints`);

    return {
      baseUrl: validBaseUrl || cleanUrl,
      isValid: detectedEndpoints.length > 0,
      detectedEndpoints,
      errorDetails: detectedEndpoints.length === 0 ? lastError : undefined,
      isForceMode: false,
    };
  }

  /**
   * 测试强制模式下的URL
   */
  private async testForcedUrl(forcedUrl: string, apiKey: string): Promise<{ baseUrl: string; isValid: boolean; detectedEndpoints: string[]; errorDetails?: string; isForceMode: boolean }> {
    console.log(`🔒 Testing forced URL: ${forcedUrl}`);

    try {
      // 创建超时Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout (10s)')), 10000);
      });

      // 强制模式下，直接测试用户指定的完整URL
      // 不添加任何端点，因为用户已经指定了完整路径
      const fetchPromise = fetch(forcedUrl, {
        method: 'POST', // 尝试POST请求来测试chat/completions端点
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      console.log(`🔒 Forced URL response status: ${response.status}`);

      // 在强制模式下，即使返回错误状态码，只要不是404/405，就认为端点存在
      // 因为可能是API Key问题或其他认证问题
      const isValid = response.status !== 404 && response.status !== 405 && response.status !== 501;

      if (isValid) {
        console.log(`✅ Forced URL is valid: ${forcedUrl}`);
        return {
          baseUrl: forcedUrl,
          isValid: true,
          detectedEndpoints: [forcedUrl],
          isForceMode: true,
        };
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.log(`❌ Forced URL failed: ${response.status} - ${errorText}`);
        return {
          baseUrl: forcedUrl,
          isValid: false,
          detectedEndpoints: [],
          errorDetails: `HTTP ${response.status}: ${errorText}`,
          isForceMode: true,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Forced URL test failed:`, errorMessage);
      return {
        baseUrl: forcedUrl,
        isValid: false,
        detectedEndpoints: [],
        errorDetails: errorMessage,
        isForceMode: true,
      };
    }
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    if (!this.config.apiKey) {
      throw new Error('API Key is required');
    }

    if (!this.config.baseUrl) {
      throw new Error('Base URL is required');
    }

    try {
      // 使用处理后的URL
      const apiUrl = this.processBaseUrl(this.config.baseUrl, '/models');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch models: ${response.status} - ${errorData}`);
      }

      const data: ModelsResponse = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from models API');
      }

      console.log(`📊 Total models received: ${data.data.length}`);
      console.log('📋 All models:', data.data.map(m => m.id));

      // 过滤掉明显不是聊天模型的（如embedding、whisper等）
      const excludeKeywords = [
        'embedding', 'embed', 'whisper', 'tts', 'dall-e', 'davinci-edit',
        'text-search', 'text-similarity', 'code-search', 'moderation'
      ];

      const chatModels = data.data.filter(model => {
        const modelId = model.id.toLowerCase();

        // 排除明显不是聊天模型的
        const shouldExclude = excludeKeywords.some(keyword => modelId.includes(keyword));
        if (shouldExclude) {
          console.log(`❌ Excluded model: ${model.id} (contains excluded keyword)`);
          return false;
        }

        console.log(`✅ Included model: ${model.id}`);
        return true;
      });

      console.log(`📊 Filtered models count: ${chatModels.length}`);

      // 按名称排序
      return chatModels.sort((a, b) => a.id.localeCompare(b.id));
    } catch (error) {
      console.error('Get models API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching models');
    }
  }
}
