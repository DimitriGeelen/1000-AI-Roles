module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['./jest.setup.js']
};