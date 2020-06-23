import { useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ORANGE } from './constants';

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
      StatusBar.setBackgroundColor('#fff', 'fade');
      StatusBar.setBarStyle('dark-content', 'fade');
      return () => {
        StatusBar.setBackgroundColor(ORANGE, 'fade');
        StatusBar.setBarStyle('light-content', 'fade');
      };
    }, []),
  );
}
