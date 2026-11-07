import { requireOptionalNativeModule, type NativeModule } from 'expo';
import type { WidgetData } from '@/types/widgets';

// Our Android home-screen widgets (android/.../HomeWidgets.kt): Calendar,
// Volume, Next in Cycle and Recovery. They keep the last data sent here and work out
// "today" and "this week" themselves, so they stay right with the app closed.
// Missing in builds made before they existed, so the call is optional.



declare class HomeWidgetsModule extends NativeModule {
  update(json: string): void;
}

const native = requireOptionalNativeModule<HomeWidgetsModule>('HomeWidgets');

export function updateHomeWidgets(data: WidgetData) {
  native?.update(JSON.stringify(data));
}
