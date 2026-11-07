import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NOTIFICATION_BUTTON_IDS } from './notification';

const KOTLIN = `${__dirname}/../modules/workout-notification/android/src/main/java/expo/modules/workoutnotification/Constants.kt`;

describe('notification button ids', () => {
  it('are the same in the app and in the native notification', () => {
    const kotlin = fs.readFileSync(KOTLIN, 'utf-8');
    const native = Object.fromEntries(
      [...kotlin.matchAll(/const val BUTTON_(\w+) = "(\w+)"/g)].map(([, name, id]) => [name, id])
    );
    expect(native).toEqual({
      COMPLETE: NOTIFICATION_BUTTON_IDS.complete,
      SKIP: NOTIFICATION_BUTTON_IDS.skip,
      MINUS_15: NOTIFICATION_BUTTON_IDS.minus15,
      PLUS_15: NOTIFICATION_BUTTON_IDS.plus15,
    });
  });
});
