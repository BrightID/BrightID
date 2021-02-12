import { useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WHITE, ORANGE } from '@/theme/colors';
import { DEVICE_ANDROID } from './deviceConstants';

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, delay);
    return () => {
      clearInterval(id);
    };
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

export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}