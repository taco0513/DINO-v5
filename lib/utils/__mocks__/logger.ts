/**
 * Mock logger for testing
 */

export const logger = {
  debug: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}