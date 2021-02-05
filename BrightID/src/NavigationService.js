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

export const openDrawer = () => {
  navigationRef.current?.dispatch(DrawerActions.openDrawer());
};

export const closeDrawer = () => {
  navigationRef.current?.dispatch(DrawerActions.closeDrawer());
};

export const resetHome = () => {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });
};

export const resetNotifications = () => {
  navigationRef.current?.reset({
    index: 1,
    routes: [{ name: 'Home' }, { name: 'Notifications' }],
  });
};

export const dispatch = (action) => {
  navigationRef.current?.dispatch(action);
};

export const getRoute = () => {
  const route = navigationRef.current?.getCurrentRoute();
  return route;
};
