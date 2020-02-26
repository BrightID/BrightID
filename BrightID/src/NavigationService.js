// NavigationService.js

import { NavigationActions } from 'react-navigation';

let _navigator;

export const setTopLevelNavigator = (navigatorRef) => {
  console.log('here');
  _navigator = navigatorRef;
};

export const navigate = (routeName, params) => {
  if (!_navigator) return;
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    }),
  );
};
