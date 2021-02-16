import AsyncStorage from '@react-native-async-storage/async-storage';

export default {
  getItem: async (key) => {
    let value = await AsyncStorage.getItem(key);
    if (value) {
      return value;
    } else {
      throw new Error('key does not exist in AsyncStorage');
    }
  },
  setItem: (key, value) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    return AsyncStorage.removeItem(key);
  },
};
