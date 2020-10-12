import AsyncStorage from '@react-native-community/async-storage';

export default {
  getItem: async (key) => {
    let value = await AsyncStorage.getItem(key);

    if (value) {
      console.log('asGetItem', key, true);
      return value;
    } else {
      console.log('asGetItem', key, false);
      throw new Error('key does not exist in AsyncStorage');
    }
  },
  setItem: async (key, value) => {
    console.log('asSetItem', key, value);
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    console.log('asRemoveItem', key);
    return AsyncStorage.removeItem(key);
  },
};
