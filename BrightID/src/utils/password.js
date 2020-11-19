// @flow
import { Alert } from 'react-native';

export const validatePass = (pass1, pass2) => {
  if (pass1 !== pass2) {
    Alert.alert('Error', 'Password and confirm password does not match.');
  } else if (pass1.length < 8) {
    Alert.alert('Error', 'Your password must be at least 8 characters long.');
  } else {
    return true;
  }
};
