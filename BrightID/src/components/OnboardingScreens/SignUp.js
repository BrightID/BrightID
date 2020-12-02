// @flow

import React, { useRef, useState } from 'react';
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
import { useActionSheet } from '@expo/react-native-action-sheet';
import Spinner from 'react-native-spinkit';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useDispatch } from 'react-redux';
import { takePhoto, chooseImage } from '@/utils/images';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE, DEVICE_OS } from '@/utils/deviceConstants';
import { handleBrightIdCreation } from './actions';
import { checkTasks } from '../Tasks/TasksSlice';

const Container = DEVICE_OS === 'ios' ? KeyboardAvoidingView : View;

export const SignUp = ({ navigation }) => {
  const dispatch = useDispatch();
  const textBoxRef = useRef(null);
  const [name, setName] = useState('');
  const [finalBase64, setfinalBase64] = useState('');
  const [creatingBrightId, setCreatingBrightId] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();

  const getPhotoFromCamera = async () => {
    try {
      const { mime, data } = await takePhoto();
      const uri = `data:${mime};base64,${data}`;
      setfinalBase64(uri);
    } catch (err) {
      console.log(err);
    }
  };

  const getPhotoFromLibrary = async () => {
    try {
      const { mime, data } = await chooseImage();
      const uri = `data:${mime};base64,${data}`;
      setfinalBase64(uri);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddPhoto = () => {
    showActionSheetWithOptions(
      {
        options: ['Take Photo', 'Choose From Library', 'cancel'],
        cancelButtonIndex: 2,
        title: 'Select photo',
        showSeparators: true,
        textStyle: {
          color: '#2185D0',
          textAlign: 'center',
          width: '100%',
          fontSize: DEVICE_LARGE ? 18 : 16,
        },
        titleTextStyle: {
          textAlign: 'center',
          fontSize: DEVICE_LARGE ? 20 : 17,
          width: '100%',
        },
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          getPhotoFromCamera();
        } else if (buttonIndex === 1) {
          getPhotoFromLibrary();
        }
      },
    );
  };

  const createBrightID = async () => {
    try {
      console.log('HERE');
      textBoxRef.current?.blur();
      setCreatingBrightId(true);
      if (name.length < 2) {
        setCreatingBrightId(false);
        return Alert.alert(
          'BrightID Form Incomplete',
          name.length === 0
            ? 'Please add your name'
            : 'Your name must be at least 2 characters',
        );
      }
      if (!finalBase64) {
        setCreatingBrightId(false);
        return Alert.alert(
          'BrightID Form Incomplete',
          'A photo is required. Please press enter on the keyboard.',
        );
      }
      const result = await dispatch(
        handleBrightIdCreation({ photo: { uri: finalBase64 }, name }),
      );
      if (result) {
        dispatch(checkTasks());
        navigation.navigate('App');
      } else {
        setCreatingBrightId(false);
      }
    } catch (err) {
      setCreatingBrightId(false);
    }
  };

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
          {finalBase64 && !editingName ? (
            <TouchableOpacity
              testID="editPhoto"
              onPress={handleAddPhoto}
              accessible={true}
              accessibilityLabel="edit photo"
            >
              <Image style={styles.photo} source={{ uri: finalBase64 }} />
            </TouchableOpacity>
          ) : !editingName ? (
            <TouchableOpacity
              testID="addPhoto"
              onPress={handleAddPhoto}
              style={styles.addPhoto}
              accessible={true}
              accessibilityLabel="add photo"
            >
              <Text style={styles.addPhotoText}>Add Photo</Text>
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
          <Text style={styles.midText}>What do your friends know you by?</Text>
          <TextInput
            testID="editName"
            ref={textBoxRef}
            onChangeText={setName}
            value={name}
            placeholder="Name"
            placeholderTextColor="#9e9e9e"
            style={styles.textInput}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="name"
            underlineColorAndroid="transparent"
            onFocus={() => {
              setEditingName(true);
            }}
            onBlur={() => {
              setEditingName(false);
            }}
            blurOnSubmit={true}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonInfoText}>
            Your name and photo will never be shared with apps or stored on
            servers
          </Text>
          {!creatingBrightId ? (
            <View>
              <TouchableOpacity
                testID="createBrightIDBtn"
                style={styles.createBrightIdButton}
                onPress={() => {
                  createBrightID();
                }}
              >
                <Text style={styles.buttonInnerText}>Create My BrightID</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="recoverBrightIDBtn"
                onPress={() => navigation.navigate('Restore')}
                style={styles.recoverButton}
                accessibilityLabel="Recover BrightID"
              >
                <Text style={styles.recoverButtonText}>Recover BrightID</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loader} testID="creatingIDSpinner">
              <Text>Creating Bright ID...</Text>
              <Spinner isVisible={true} size={47} type="Wave" color="#4990e2" />
            </View>
          )}
        </View>
      </Container>
    </>
  );
};

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

export default SignUp;
