// Asks Android for the display's fastest refresh rate (90 or 120 hz). Many
// phones keep an app at 60 hz unless its window says otherwise, and React
// Native does not. The hint goes on the window (preferredRefreshRate), which
// Android recommends when an app only wants a refresh rate and not a new
// resolution. The system can still pick lower, e.g. in battery saver.
const { withMainActivity } = require('expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

const TAG = 'hevier-refresh-rate';

// Same resolution as now, so the screen never changes size.
const REQUEST_PEAK_REFRESH_RATE = `    @Suppress("DEPRECATION")
    val screen = windowManager.defaultDisplay
    val peak = screen.supportedModes
        .filter { it.physicalWidth == screen.mode.physicalWidth && it.physicalHeight == screen.mode.physicalHeight }
        .maxOfOrNull { it.refreshRate } ?: 0f
    if (peak > 0f) {
      window.attributes = window.attributes.also { it.preferredRefreshRate = peak }
    }`;

// Safe to run again: the block carries a tag and is replaced, not repeated.
function patchMainActivity(contents) {
  const result = mergeContents({
    src: contents,
    newSrc: REQUEST_PEAK_REFRESH_RATE,
    tag: TAG,
    anchor: /super\.onCreate\(null\)/,
    offset: 1,
    comment: '    //',
  });
  return result.contents;
}

module.exports = function withHevierRefreshRate(config) {
  return withMainActivity(config, (config) => {
    if (config.modResults.language !== 'kt') throw new Error('withHevierRefreshRate: MainActivity is not Kotlin');
    config.modResults.contents = patchMainActivity(config.modResults.contents);
    return config;
  });
};
module.exports.patchMainActivity = patchMainActivity;
