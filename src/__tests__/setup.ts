// Jest setup file

// Mock Vercel KV
jest.mock('@vercel/kv', () => ({
  kv: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    expire: jest.fn().mockResolvedValue(1),
    ping: jest.fn().mockResolvedValue('PONG'),
  },
}));

// Mock performance.now for consistent timing tests
const mockPerformanceNow = jest.fn();
let performanceTime = 0;

mockPerformanceNow.mockImplementation(() => {
  performanceTime += 1;
  return performanceTime;
});

global.performance = {
  ...global.performance,
  now: mockPerformanceNow,
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  performanceTime = 0;
});
