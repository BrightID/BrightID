// @flow
import i18next from 'i18next';
import { Alert } from 'react-native';

export const validatePass = (pass1, pass2) => {
  if (pass1 !== pass2) {
    Alert.alert(
      i18next.t('common.alert.error'), 
      i18next.t('common.alert.text.passwordMatch')
    );
  } else if (pass1.length < 8) {
    Alert.alert(
      i18next.t('common.alert.error'), 
      i18next.t('common.alert.text.passwordShort')
    );
  } else {
    return true;
  }
};
