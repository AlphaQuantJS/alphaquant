export default {
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/__tests__/*.test.{js,mjs}', '**/*.{spec,test}.{js,mjs}'],
  transformIgnorePatterns: ['node_modules/(?!(data-forge|data-forge-fs)/)'],
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  testRunner: 'jest-circus/runner',
};
