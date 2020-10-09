// @flow

import * as React from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { withTranslation } from 'react-i18next';
import { takePhoto, chooseImage } from '@/utils/images';
import { DEVICE_LARGE, DEVICE_OS, ORANGE } from '@/utils/constants';
import { handleBrightIdCreation } from './actions';
import { checkTasks } from '../Tasks/TasksSlice';

type State = {
  name: string,
  finalBase64: { uri: string },
  creatingBrightId: boolean,
  editingName: boolean,
};

const Container = DEVICE_OS === 'ios' ? KeyboardAvoidingView : View;

export class SignUp extends React.Component<Props, State> {
  photoSheetRef: string;

  textBoxRef: string;

  // eslint-disable-next-line react/state-in-constructor
  state = {
    name: '',
    finalBase64: { uri: '' },
    creatingBrightId: false,
    editingName: false,
  };

  getPhotoFromCamera = async () => {
    try {
      const { mime, data } = await takePhoto();
      const finalBase64 = {
        uri: `data:${mime};base64,${data}`,
      };
      this.setState({
        finalBase64,
      });
    } catch (err) {
      console.log(err);
    }
  };

  getPhotoFromLibrary = async () => {
    try {
      const { mime, data } = await chooseImage();
      const finalBase64 = {
        uri: `data:${mime};base64,${data}`,
      };
      this.setState({
        finalBase64,
      });
    } catch (err) {
      console.log(err);
    }
  };

  onAddPhoto = () => {
    this.photoSheetRef.show();
  };

  createBrightID = async () => {
    const { t } = this.props;
    try {
      const { finalBase64, name } = this.state;
      const { navigation, dispatch } = this.props;
      this.textBoxRef?.blur();
      this.setState({
        creatingBrightId: true,
      });
      if (name.length < 2) {
        this.setState({
          creatingBrightId: false,
        });
        return Alert.alert(
          t('common.alert.formIncomplete'),
          name.length === 0
            ? t('signup.alert.nameMissing')
            : t('signup.alert.nameTooShort'),
        );
      }
      if (!finalBase64.uri) {
        this.setState({
          creatingBrightId: false,
        });
        return Alert.alert(
          t('common.alert.formIncomplete'),
          t('signup.alert.photoMissing'),
        );
      }
      const result = await dispatch(
        handleBrightIdCreation({ photo: finalBase64, name }),
      );
      if (result) {
        dispatch(checkTasks());
        navigation.navigate('App');
      } else {
        this.setState({
          creatingBrightId: false,
        });
      }
    } catch (err) {
      this.setState({
        creatingBrightId: false,
      });
    }
  };

  render() {
    const { name, finalBase64, creatingBrightId, editingName } = this.state;
    const { t } = this.props;

    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor={ORANGE}
          animated={true}
        />
        <View style={styles.orangeTop} />
        <Container style={styles.container} behavior="padding">
          <View style={styles.addPhotoContainer}>
            {finalBase64.uri && !editingName ? (
              <TouchableOpacity
                testID="editPhoto"
                onPress={this.onAddPhoto}
                accessible={true}
                accessibilityLabel={t('common.accessibilityLabel.editPhoto')}
              >
                <Image style={styles.photo} source={finalBase64} />
              </TouchableOpacity>
            ) : !editingName ? (
              <TouchableOpacity
                testID="addPhoto"
                onPress={this.onAddPhoto}
                style={styles.addPhoto}
                accessible={true}
                accessibilityLabel={t('signup.accessibilityLabel.addPhoto')}
              >
                <Text style={styles.addPhotoText}>{t('signup.button.addPhoto')}</Text>
                <SimpleLineIcons
                  size={DEVICE_LARGE ? 42 : 36}
                  name="camera"
                  color="#979797"
                />
              </TouchableOpacity>
            ) : (
              <View />
            )}
          </View>
          <View style={styles.textInputContainer}>
            <Text style={styles.midText}>
              {t('signup.text.whatsYouName')}
            </Text>
            <TextInput
              testID="editName"
              ref={(o) => {
                this.textBoxRef = o;
              }}
              onChangeText={(name) => this.setState({ name })}
              value={name}
              placeholder={t('signup.placeholder.name')}
              placeholderTextColor="#9e9e9e"
              style={styles.textInput}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="name"
              underlineColorAndroid="transparent"
              onFocus={() => {
                this.setState({ editingName: true });
              }}
              onBlur={() => {
                this.setState({ editingName: false });
              }}
              blurOnSubmit={true}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonInfoText}>
              {t('signup.text.infoNotShared')}
            </Text>
            {!creatingBrightId ? (
              <View>
                <TouchableOpacity
                  testID="createBrightIDBtn"
                  style={styles.createBrightIdButton}
                  onPress={this.createBrightID}
                >
                  <Text style={styles.buttonInnerText}>{t('signup.button.createAccount')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="recoverBrightIDBtn"
                  onPress={() => this.props.navigation.navigate('Restore')}
                  style={styles.recoverButton}
                  accessibilityLabel="Recover BrightID"
                >
                  <Text style={styles.recoverButtonText}>{t('signup.button.recoverAccount')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.loader} testID="creatingIDSpinner">
                <Text>{t('signup.text.creatingAccount')}</Text>
                <Spinner
                  isVisible={true}
                  size={47}
                  type="Wave"
                  color="#4990e2"
                />
              </View>
            )}
          </View>
          <ActionSheet
            ref={(o) => {
              this.photoSheetRef = o;
            }}
            title={t('common.photoActionSheet.title')}
            options={[t('common.photoActionSheet.takePhoto'), t('common.photoActionSheet.choosePhoto'), t('common.actionSheet.cancel')]}
            cancelButtonIndex={2}
            onPress={(index) => {
              if (index === 0) {
                this.getPhotoFromCamera();
              } else if (index === 1) {
                this.getPhotoFromLibrary();
              }
            }}
          />
        </Container>
      </>
    );
  }
}

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 60,
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
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  addPhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_LARGE ? 28 : 25,
  },
  textInputContainer: {
    marginTop: DEVICE_LARGE ? 28 : 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: DEVICE_LARGE ? 35 : 28,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  addPhoto: {
    borderWidth: 1,
    borderColor: '#979797',
    height: DEVICE_LARGE ? 160 : 140,
    width: DEVICE_LARGE ? 160 : 140,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: DEVICE_LARGE ? 160 : 140,
    height: DEVICE_LARGE ? 160 : 140,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  hidden: {
    display: 'none',
  },
  addPhotoText: {
    fontFamily: 'ApexNew-Book',
    color: '#979797',
    marginBottom: 11,
    marginTop: 11,
    fontSize: DEVICE_LARGE ? 18 : 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  midText: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
  },
  textInput: {
    fontFamily: 'ApexNew-Light',
    fontSize: DEVICE_LARGE ? 28 : 25,
    color: '#333',
    fontWeight: '300',
    fontStyle: 'normal',
    letterSpacing: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9e9e9e',
    marginTop: DEVICE_LARGE ? 16 : 14,
    width: DEVICE_LARGE ? 275 : 250,
    textAlign: 'center',
    height: 60,
  },
  buttonInfoText: {
    fontFamily: 'ApexNew-Book',
    color: '#9e9e9e',
    fontSize: DEVICE_LARGE ? 14 : 12,
    width: 298,
    textAlign: 'center',
  },
  createBrightIdButton: {
    backgroundColor: '#428BE5',
    width: DEVICE_LARGE ? 285 : 260,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: DEVICE_LARGE ? 14 : 12,
    paddingBottom: DEVICE_LARGE ? 13 : 11,
    marginTop: 22,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: DEVICE_LARGE ? 18 : 16,
  },
  recoverButton: {
    width: DEVICE_LARGE ? 285 : 260,
    borderWidth: 1,
    borderColor: '#4990e2',
    paddingTop: DEVICE_LARGE ? 14 : 12,
    paddingBottom: DEVICE_LARGE ? 13 : 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  recoverButtonText: {
    fontFamily: 'ApexNew-Medium',
    color: '#4990e2',
    fontSize: DEVICE_LARGE ? 18 : 16,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

export default connect()(withTranslation()(SignUp));
