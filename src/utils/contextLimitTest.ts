import { Message, ChatGroup } from '../types';

/**
 * 测试上下文限制功能的工具函数
 */
export class ContextLimitTest {
  /**
   * 模拟上下文限制的应用
   */
  static applyContextLimit(
    contextMessages: Message[], 
    chatGroup: ChatGroup | undefined
  ): Message[] {
    const contextLimit = chatGroup?.contextLimit;
    
    if (contextLimit === undefined) {
      // 不限制上下文
      return contextMessages;
    }
    
    if (contextMessages.length <= contextLimit) {
      // 消息数量未超过限制
      return contextMessages;
    }
    
    // 应用限制，保留最后N条消息
    return contextMessages.slice(-contextLimit);
  }

  /**
   * 创建测试消息
   */
  static createTestMessage(id: string, content: string, role: 'user' | 'assistant' = 'user'): Message {
    return {
      id,
      role,
      content,
      timestamp: Date.now(),
      groupId: 'test-group',
    };
  }

  /**
   * 创建测试聊天组
   */
  static createTestChatGroup(contextLimit?: number): ChatGroup {
    return {
      id: 'test-group',
      name: 'Test Group',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
      contextLimit,
    };
  }

  /**
   * 测试场景1：无限制上下文
   */
  static testUnlimitedContext(): boolean {
    const messages = [
      this.createTestMessage('1', 'Message 1'),
      this.createTestMessage('2', 'Message 2'),
      this.createTestMessage('3', 'Message 3'),
      this.createTestMessage('4', 'Message 4'),
      this.createTestMessage('5', 'Message 5'),
    ];
    
    const chatGroup = this.createTestChatGroup(); // 无限制
    const result = this.applyContextLimit(messages, chatGroup);
    
    console.log('Test Unlimited Context:', {
      input: messages.length,
      output: result.length,
      expected: 5,
      passed: result.length === 5
    });
    
    return result.length === 5;
  }

  /**
   * 测试场景2：限制为3条
   */
  static testLimitedContext(): boolean {
    const messages = [
      this.createTestMessage('1', 'Message 1'),
      this.createTestMessage('2', 'Message 2'),
      this.createTestMessage('3', 'Message 3'),
      this.createTestMessage('4', 'Message 4'),
      this.createTestMessage('5', 'Message 5'),
    ];
    
    const chatGroup = this.createTestChatGroup(3); // 限制为3条
    const result = this.applyContextLimit(messages, chatGroup);
    
    console.log('Test Limited Context (3):', {
      input: messages.length,
      output: result.length,
      expected: 3,
      lastMessages: result.map(m => m.content),
      passed: result.length === 3 && result[0].content === 'Message 3'
    });
    
    return result.length === 3 && result[0].content === 'Message 3';
  }

  /**
   * 测试场景3：限制为1条（独立对话）
   */
  static testIndependentContext(): boolean {
    const messages = [
      this.createTestMessage('1', 'Message 1'),
      this.createTestMessage('2', 'Message 2'),
      this.createTestMessage('3', 'Message 3'),
    ];
    
    const chatGroup = this.createTestChatGroup(1); // 限制为1条
    const result = this.applyContextLimit(messages, chatGroup);
    
    console.log('Test Independent Context (1):', {
      input: messages.length,
      output: result.length,
      expected: 1,
      lastMessage: result[0]?.content,
      passed: result.length === 1 && result[0].content === 'Message 3'
    });
    
    return result.length === 1 && result[0].content === 'Message 3';
  }

  /**
   * 测试场景4：消息数量少于限制
   */
  static testFewerMessagesThanLimit(): boolean {
    const messages = [
      this.createTestMessage('1', 'Message 1'),
      this.createTestMessage('2', 'Message 2'),
    ];
    
    const chatGroup = this.createTestChatGroup(5); // 限制为5条，但只有2条消息
    const result = this.applyContextLimit(messages, chatGroup);
    
    console.log('Test Fewer Messages Than Limit:', {
      input: messages.length,
      output: result.length,
      expected: 2,
      passed: result.length === 2
    });
    
    return result.length === 2;
  }

  /**
   * 运行所有测试
   */
  static runAllTests(): boolean {
    console.log('🧪 Running Context Limit Tests...');
    
    const tests = [
      this.testUnlimitedContext(),
      this.testLimitedContext(),
      this.testIndependentContext(),
      this.testFewerMessagesThanLimit(),
    ];
    
    const passed = tests.filter(Boolean).length;
    const total = tests.length;
    
    console.log(`✅ Tests completed: ${passed}/${total} passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('❌ Some tests failed!');
    }
    
    return passed === total;
  }
}
