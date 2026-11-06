import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

// The on-screen keyboard's height, 0 when it's closed. Android draws the app
// edge to edge, so the window no longer shrinks for the keyboard
// (adjustResize): screens pad their bottom by this instead, and a scroll view
// then brings the field being typed in above the keyboard.
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}
