import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WHITE, ORANGE } from '@/theme/colors';
import { DEVICE_ANDROID } from './deviceConstants';

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

export function useStatusBarHome() {
  useFocusEffect(
    useCallback(() => {
      if (DEVICE_ANDROID) StatusBar.setBackgroundColor(WHITE, true);

      StatusBar.setBarStyle('dark-content', true);
      return () => {
        if (DEVICE_ANDROID) StatusBar.setBackgroundColor(ORANGE, true);
        StatusBar.setBarStyle('light-content', true);
      };
    }, []),
  );
}
