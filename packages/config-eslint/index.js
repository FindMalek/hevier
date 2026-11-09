// Shared flat config: Expo's rules, plus the generated folders every package skips.
// A package uses it with: module.exports = require('@hevier/config-eslint');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Pinned so packages without react (shared, sync) don't warn about "detect".
    settings: { react: { version: '19.2' } },
  },
  {
    ignores: ['dist/*', '.expo/*', '.turbo/*', 'android/*', 'coverage/*', 'scripts/local/*'],
  },
]);
