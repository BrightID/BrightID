// @flow

export const ADD_LINK = 'ADD_LINK';

export const addLink = (linkInfo: LinkInfo) => ({
  type: ADD_LINK,
  link: linkInfo,
});
