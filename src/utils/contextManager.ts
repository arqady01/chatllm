import { Message } from '../types';

/**
 * 上下文管理工具类
 * 提供上下文相关的辅助函数
 */
export class ContextManager {
  /**
   * 从消息数组中重建上下文
   * 找到最后一个上下文分隔符之后的所有消息
   */
  static rebuildContext(messages: Message[]): Message[] {
    const lastSeparatorIndex = messages
      .map((msg, index) => msg.isContextSeparator ? index : -1)
      .filter(index => index !== -1)
      .pop() ?? -1;
    
    return messages
      .slice(lastSeparatorIndex + 1)
      .filter(msg => !msg.isContextSeparator);
  }

  /**
   * 验证消息是否适合加入上下文
   */
  static isValidForContext(message: Message): boolean {
    const hasContent = message.content && message.content.trim();
    const hasImage = message.imageBase64;
    const isNotSeparator = !message.isContextSeparator;

    const isValid = (hasContent || hasImage) && isNotSeparator;

    if (!isValid) {
      console.log('Message filtered out:', {
        id: message.id,
        hasContent: !!hasContent,
        hasImage: !!hasImage,
        isNotSeparator,
        role: message.role
      });
    }

    return isValid;
  }

  /**
   * 构建发送给API的消息格式
   */
  static buildApiMessages(contextMessages: Message[]): Array<{
    role: string;
    content: string | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: { url: string };
    }>;
  }> {
    console.log('Building API messages from context:', contextMessages.length, 'messages');

    const validMessages = contextMessages.filter(this.isValidForContext);
    console.log('Valid messages for API:', validMessages.length);

    if (validMessages.length === 0) {
      console.warn('No valid messages found for API call');
      return [];
    }

    return validMessages.map(msg => {
        if (msg.imageBase64) {
          // 多模态消息
          let cleanBase64 = msg.imageBase64.replace(/[\r\n\s]/g, '');
          
          // 验证base64格式
          const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
          if (!base64Regex.test(cleanBase64)) {
            console.error('Invalid base64 format');
            return {
              role: msg.role,
              content: msg.content || '图片格式错误，无法发送',
            };
          }

          const mimeType = msg.imageMimeType || 'image/jpeg';
          const imageDataUrl = `data:${mimeType};base64,${cleanBase64}`;

          return {
            role: msg.role,
            content: [
              ...(msg.content ? [{ type: 'text' as const, text: msg.content }] : []),
              {
                type: 'image_url' as const,
                image_url: { url: imageDataUrl },
              },
            ],
          };
        } else {
          // 纯文本消息
          return {
            role: msg.role,
            content: msg.content || '空消息',
          };
        }
      });
  }

  /**
   * 获取上下文统计信息
   */
  static getContextStats(contextMessages: Message[], allMessages: Message[]) {
    return {
      contextLength: contextMessages.length,
      totalMessages: allMessages.length,
      contextRatio: allMessages.length > 0 ? contextMessages.length / allMessages.length : 0,
      hasImages: contextMessages.some(msg => msg.imageBase64),
      textOnlyMessages: contextMessages.filter(msg => !msg.imageBase64).length,
      imageMessages: contextMessages.filter(msg => msg.imageBase64).length,
    };
  }
}
