// The native tab bar's Android resources (app/(tabs)/_layout.tsx): the six
// tab icons (outline and selected, drawn for Hevier) and the sizes that make
// Material's bar look like Hevy's. They live in plugins/android-res/ and are
// copied into the generated android/ folder on every prebuild.
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

function copyFolder(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const src = path.join(from, name);
    const dest = path.join(to, name);
    if (fs.statSync(src).isDirectory()) copyFolder(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

module.exports = function withHevierTabBar(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const { projectRoot, platformProjectRoot } = config.modRequest;
      copyFolder(path.join(projectRoot, 'plugins', 'android-res'), path.join(platformProjectRoot, 'app', 'src', 'main', 'res'));
      return config;
    },
  ]);
};
