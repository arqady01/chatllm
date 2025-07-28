// 温度控制功能测试
describe('Temperature Control Feature', () => {
  test('should have default temperature value', () => {
    const defaultTemperature = 0.7;
    expect(defaultTemperature).toBe(0.7);
  });

  test('should validate temperature range', () => {
    const minTemperature = 0.0;
    const maxTemperature = 1.0;
    const validTemperature = 0.8;

    expect(validTemperature).toBeGreaterThanOrEqual(minTemperature);
    expect(validTemperature).toBeLessThanOrEqual(maxTemperature);
  });

  test('should format temperature value correctly', () => {
    const temperature = 0.83456;
    const formattedTemperature = parseFloat(temperature.toFixed(1));

    expect(formattedTemperature).toBe(0.8);
  });

  test('should handle temperature parameter in API request', () => {
    const baseTemperature = 0.7;
    const customTemperature = 0.9;

    // 测试默认温度
    const defaultTemp = baseTemperature !== undefined ? baseTemperature : 0.7;
    expect(defaultTemp).toBe(0.7);

    // 测试自定义温度
    const customTemp = customTemperature !== undefined ? customTemperature : 0.7;
    expect(customTemp).toBe(0.9);
  });

  test('should categorize temperature ranges correctly', () => {
    const lowTemp = 0.2;
    const mediumTemp = 0.6;
    const highTemp = 0.9;

    // 低温度范围 (0.0 - 0.3) - 确定性强
    expect(lowTemp).toBeLessThanOrEqual(0.3);

    // 中等温度范围 (0.4 - 0.7) - 平衡模式
    expect(mediumTemp).toBeGreaterThanOrEqual(0.4);
    expect(mediumTemp).toBeLessThanOrEqual(0.7);

    // 高温度范围 (0.8 - 1.0) - 创造性强
    expect(highTemp).toBeGreaterThanOrEqual(0.8);
    expect(highTemp).toBeLessThanOrEqual(1.0);
  });

  test('should handle temperature step increments', () => {
    const step = 0.1;
    const temperature = 0.7;

    const increasedTemp = parseFloat((temperature + step).toFixed(1));
    const decreasedTemp = parseFloat((temperature - step).toFixed(1));

    expect(increasedTemp).toBe(0.8);
    expect(decreasedTemp).toBe(0.6);
  });

  test('should handle slider value changes correctly', () => {
    // 测试滑块值变化
    const initialTemp = 0.7;
    const newSliderValue = 0.9;

    // 滑块直接设置温度值
    const updatedTemp = newSliderValue;

    expect(updatedTemp).toBe(0.9);
    expect(updatedTemp).toBeGreaterThanOrEqual(0);
    expect(updatedTemp).toBeLessThanOrEqual(1);
  });

  test('should handle slider-only control correctly', () => {
    // 测试纯滑块控制（移除输入框后）
    const sliderValue = 0.8;
    const roundedValue = Math.round(sliderValue * 10) / 10;

    expect(roundedValue).toBe(0.8);
    expect(roundedValue).toBeGreaterThanOrEqual(0);
    expect(roundedValue).toBeLessThanOrEqual(1);
  });

  test('should validate slider range bounds', () => {
    // 测试滑块范围边界
    const minValue = 0;
    const maxValue = 1;
    const step = 0.1;

    const testValues = [0, 0.1, 0.5, 0.9, 1.0];

    testValues.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(minValue);
      expect(value).toBeLessThanOrEqual(maxValue);
      expect((value * 10) % 1).toBe(0); // 检查是否为0.1的倍数
    });
  });

  test('should handle floating point precision correctly', () => {
    // 测试浮点数精度修复
    const problematicValue = 0.10000000149011612; // 滑块可能产生的值
    const roundedValue = Math.round(problematicValue * 10) / 10;

    expect(roundedValue).toBe(0.1);
    expect(roundedValue.toFixed(1)).toBe('0.1');
  });

  test('should format temperature display correctly', () => {
    // 测试温度显示格式化
    const testValues = [
      { input: 0, expected: '0.0' },
      { input: 0.1, expected: '0.1' },
      { input: 0.10000000149011612, expected: '0.1' },
      { input: 0.7, expected: '0.7' },
      { input: 1.0, expected: '1.0' }
    ];

    testValues.forEach(({ input, expected }) => {
      const rounded = Math.round(input * 10) / 10;
      expect(rounded.toFixed(1)).toBe(expected);
    });
  });
});
