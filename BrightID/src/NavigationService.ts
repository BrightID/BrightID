// NavigationService.js

import {
  DrawerActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigate = (name: string, params = {}) => {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(name, params);
  }
};

export const goBack = () => {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
};

export const toggleDrawer = () => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(DrawerActions.toggleDrawer());
  }
};

export const openDrawer = () => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(DrawerActions.openDrawer());
  }
};

export const closeDrawer = () => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(DrawerActions.closeDrawer());
  }
};

export const resetHome = () => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }
};

export const resetNotifications = () => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 1,
      routes: [{ name: 'Home' }, { name: 'Notifications' }],
    });
  }
};

export const dispatch = (action) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(action);
  }
};

export const getRoute = () => {
  if (navigationRef.isReady()) {
    const route = navigationRef.getCurrentRoute();
    return route;
  }
};
