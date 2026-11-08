import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const { patchMainActivity } = createRequire(import.meta.url)('./withHevierRefreshRate.js') as {
  patchMainActivity: (contents: string) => string;
};

const MAIN_ACTIVITY = `class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-abc
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)
  }

  override fun getMainComponentName(): String = "main"
}
`;

describe('withHevierRefreshRate', () => {
  it('asks for the peak refresh rate right after super.onCreate', () => {
    const patched = patchMainActivity(MAIN_ACTIVITY);
    const lines = patched.split('\n');
    const superCall = lines.findIndex((line) => line.includes('super.onCreate(null)'));
    expect(lines[superCall + 1]).toContain('@generated begin hevier-refresh-rate');
    expect(patched).toContain('preferredRefreshRate = peak');
    expect(patched).toContain('physicalWidth == screen.mode.physicalWidth');
  });

  it('adds the block once however often it runs', () => {
    const once = patchMainActivity(MAIN_ACTIVITY);
    expect(patchMainActivity(once)).toBe(once);
    expect(once.match(/preferredRefreshRate/g)).toHaveLength(1);
  });
});
