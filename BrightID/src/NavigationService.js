// NavigationService.js

import * as React from 'react';
import { DrawerActions } from '@react-navigation/native';

export const navigationRef = React.createRef();

export const navigate = (name, params) => {
  navigationRef.current?.navigate(name, params);
};

export const goBack = () => {
  navigationRef.current?.goBack();
};

export const toggleDrawer = () => {
  navigationRef.current?.dispatch(DrawerActions.toggleDrawer());
};

export const dispatch = (action) => {
  navigationRef.current?.dispatch(action);
};

export const getRoute = () => {
  const route = navigationRef.current?.getCurrentRoute();
  return route;
};
