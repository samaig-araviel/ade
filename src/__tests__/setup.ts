// Jest setup file

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
