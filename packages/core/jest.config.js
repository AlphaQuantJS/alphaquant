export default {
  transform: {},
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/__tests__/**/*.test.{js,mjs}', '**/*.{spec,test}.{js,mjs}'],
  transformIgnorePatterns: ['node_modules/(?!(data-forge|data-forge-fs)/)'],
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  testRunner: 'jest-circus/runner',
  // Поддержка ESM
  extensionsToTreatAsEsm: ['.mjs'],
  // Оптимизация для "лёгких" тестов
  maxWorkers: 1, // один воркер → один GC‑heap
  clearMocks: true,
  restoreMocks: true,
  // отключаем coverage на юнит‑ранах — NYC/istanbul ест память
  collectCoverage: false,
};
