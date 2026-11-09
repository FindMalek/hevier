// The phone's release build:
// - signed with the key in ~/.config/hevier/keystore.properties when there is
//   one (storeFile, storePassword, keyAlias, keyPassword), else with the debug
//   key. Keep your key safe: an update signed with any other key can't be
//   installed over the old app, and uninstalling wipes its data. The android/
//   folder is generated, so the key can't live there.
// - debuggable only when built with HEVIER_DEBUGGABLE=1 (e.g.
//   `HEVIER_DEBUGGABLE=1 npx expo prebuild`): scripts/load-device.sh needs it to
//   copy the data in with run-as. Off by default: a debuggable app lets anyone
//   with the phone on USB read its data.
const { withAppBuildGradle } = require('expo/config-plugins');

// Marks our line, so a later prebuild can take it out again.
const DEBUGGABLE = 'debuggable true // HEVIER_DEBUGGABLE';

const KEY_FILE = "new File(System.getProperty('user.home'), '.config/hevier/keystore.properties')";

const SIGNING = `
        hevier {
            def props = new Properties()
            def propsFile = ${KEY_FILE}
            if (propsFile.exists()) {
                propsFile.withInputStream { props.load(it) }
                storeFile file(props['storeFile'])
                storePassword props['storePassword']
                keyAlias props['keyAlias']
                keyPassword props['keyPassword']
            }
        }`;

// The release block signed with our key, debuggable only when asked for. Safe
// to run again on an already patched file (prebuild keeps android/).
function patchGradle(gradle, debuggable) {
  if (!gradle.includes('hevier {')) {
    gradle = gradle.replace(/signingConfigs \{/, `signingConfigs {${SIGNING}`);
    gradle = gradle.replace(
      /(release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
      `$1signingConfig(${KEY_FILE}.exists() ? signingConfigs.hevier : signingConfigs.debug)`
    );
    if (!gradle.includes('signingConfigs.hevier')) throw new Error('withHevierRelease: release block not found');
  }
  // Older builds had the line without the marker.
  gradle = gradle.replace(/\n\s*debuggable true(?: \/\/ HEVIER_DEBUGGABLE)?(?=\n)/, '');
  if (debuggable) {
    gradle = gradle.replace(/(signingConfig\(.*signingConfigs\.hevier.*\))/, `$1\n            ${DEBUGGABLE}`);
  }
  return gradle;
}

module.exports = function withHevierRelease(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = patchGradle(config.modResults.contents, process.env.HEVIER_DEBUGGABLE === '1');
    return config;
  });
};
module.exports.patchGradle = patchGradle;
