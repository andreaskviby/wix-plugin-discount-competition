module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/backend/**/*.test.js'],
  collectCoverageFrom: [
    'src/backend/**/*.js',
    '!src/backend/server.js',
    '!src/backend/**/*.config.js'
  ],
  coverageDirectory: 'coverage/backend',
  setupFilesAfterEnv: ['<rootDir>/tests/backend/setup.js']
};