// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Generated files and the maintainer's gitignored scripts.
    ignores: ["dist/*", ".expo/*", "android/*", "coverage/*", "scripts/local/*"],
  }
]);
