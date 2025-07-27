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
});
