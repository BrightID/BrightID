// @flow

import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import Spinner from 'react-native-spinkit';
import { Trans, useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import emitter from '@/emitter';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE, DEVICE_OS } from '@/utils/deviceConstants';
import { recoverData } from './helpers';

const Container = DEVICE_OS === 'ios' ? KeyboardAvoidingView : View;

const RestoreScreen = () => {
  const [pass, setPass] = useState('');
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  const { t } = useTranslation();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const updateRestoreStatus = (num: number) => {
        setCompleted((prev) => prev + num);
      };

      const updateRestoreTotal = (num: number) => {
        setTotal(num);
      };

      emitter.on('restoreProgress', updateRestoreStatus);
      emitter.on('restoreTotal', updateRestoreTotal);

      () => {
        emitter.off('restoreProgress', updateRestoreStatus);
        emitter.off('restoreTotal', updateRestoreTotal);
      };
    }, []),
  );

  const restoreCompleted = async () => {
    Alert.alert(
      t('common.alert.info'),
      t('restore.alert.text.restoreSuccess'),
      [{ text: t('common.alert.ok') }],
    );
  };

  const resetState = () => {
    setRestoreInProgress(false);
    setCompleted(0);
    setTotal(0);
    setPass('');
  };

  const skip = () => {
    setPass('');
    restore();
  };

  const restore = () => {
    setRestoreInProgress(true);
    recoverData(pass)
      .then((result) => {
        result ? restoreCompleted() : resetState();
      })
      .catch((err) => {
        resetState();
        err instanceof Error ? console.warn(err.message) : console.log(err);
        if (err instanceof Error && err.message === 'bad password') {
          Alert.alert(
            t('common.alert.error'),
            t('common.alert.text.incorrectPassword'),
            [
              {
                text: t('common.alert.ok'),
                onPress: () => navigation.goBack(),
              },
            ],
          );
        }
        if (err instanceof Error && err.message === 'bad sigs') {
          Alert.alert(
            t('restore.alert.title.notTrusted'),
            t('restore.alert.text.notTrusted'),
            [
              {
                text: t('common.alert.ok'),
                onPress: () => navigation.goBack(),
              },
            ],
          );
        }
      });
  };

  const renderButtonOrSpinner = () => {
    if (!restoreInProgress)
      return (
        <TouchableOpacity style={styles.startRestoreButton} onPress={restore}>
          <Text style={styles.buttonInnerText}>
            {t('restore.button.startRestore')}
          </Text>
        </TouchableOpacity>
      );
    else if (pass)
      return (
        <View style={styles.loader}>
          <Text style={styles.textInfo}>
            {t('restore.text.downloadingData')}
          </Text>
          {total !== 0 && (
            <Text style={styles.textInfo}>
              {t('common.text.progress', {
                completed,
                total,
              })}
            </Text>
          )}
          <Spinner isVisible={true} size={97} type="Wave" color="#4990e2" />
        </View>
      );
    else
      return <Spinner isVisible={true} size={97} type="Wave" color="#4990e2" />;
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <Container style={styles.container} behavior="padding">
        <View style={styles.textInputContainer}>
          <Text style={styles.textInfo}>{t('restore.text.enterPassword')}</Text>
          <TextInput
            onChangeText={setPass}
            value={pass}
            placeholder={t('common.placeholder.password')}
            placeholderTextColor="#9e9e9e"
            style={styles.textInput}
            autoCorrect={false}
            textContentType="password"
            autoCompleteType="password"
            underlineColorAndroid="transparent"
            secureTextEntry={true}
          />
        </View>

        <View style={styles.buttonContainer}>{renderButtonOrSpinner()}</View>
        {!restoreInProgress && (
          <View style={styles.skipContainer}>
            <Text>
              <Trans
                i18nKey="restore.text.skipLoadingBackup"
                components={[
                  <Text style={styles.skipLink} onPress={skip}>
                    dummyLink
                  </Text>,
                ]}
                values={{ skipLink: t('restore.text.skipLink') }}
              />
            </Text>
          </View>
        )}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  textInputContainer: {
    marginTop: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 44,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  textInfo: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    color: '#333',
    margin: 18,
  },
  textInput: {
    fontFamily: 'ApexNew-Light',
    fontSize: 30,
    color: '#333',
    fontWeight: '300',
    fontStyle: 'normal',
    letterSpacing: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9e9e9e',
    marginTop: 22,
    width: 275,
    textAlign: 'left',
    paddingBottom: 5,
  },
  buttonInfoText: {
    fontFamily: 'ApexNew-Book',
    color: '#9e9e9e',
    fontSize: 14,
    width: 298,
    textAlign: 'center',
  },
  startRestoreButton: {
    backgroundColor: '#428BE5',
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 12,
    marginTop: 22,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  button: {
    width: 300,
    borderWidth: 1,
    borderColor: '#4990e2',
    paddingTop: 13,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  skipContainer: {
    paddingTop: 30,
    fontSize: 14,
    margin: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skipLink: {
    color: 'blue',
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

export default RestoreScreen;
