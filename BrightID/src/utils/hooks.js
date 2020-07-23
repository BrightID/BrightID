import { useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ORANGE, DEVICE_ANDROID } from './constants';

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
      if (DEVICE_ANDROID) StatusBar.setBackgroundColor('#fff', true);

      StatusBar.setBarStyle('dark-content', true);
      return () => {
        if (DEVICE_ANDROID) StatusBar.setBackgroundColor(ORANGE, true);
        StatusBar.setBarStyle('light-content', true);
      };
    }, []),
  );
}
