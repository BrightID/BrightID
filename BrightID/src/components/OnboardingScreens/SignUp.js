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
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { handleBrightIdCreation } from './actions';
import { takePhoto, chooseImage } from '@/utils/images';
import { DEVICE_TYPE, DEVICE_OS } from '@/utils/constants';

type State = {
  name: string,
  finalBase64: { uri: string },
  creatingBrightId: boolean,
  editingName: boolean,
};

const Container = DEVICE_OS === 'ios' ? KeyboardAvoidingView : View;

export class SignUp extends React.Component<Props, State> {
  photoSheetRef: string;

  static navigationOptions = {
    title: 'BrightID',
    headerBackTitle: 'SignUp',
    headerStyle: {
      backgroundColor: '#f48b1e',
    },
    headerRight: () => (
      <TouchableOpacity style={{ marginRight: 11 }}>
        <Ionicons name="ios-help-circle-outline" size={32} color="#fff" />
      </TouchableOpacity>
    ),
    headerShown: DEVICE_TYPE === 'large',
  };

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
    try {
      const { finalBase64, name } = this.state;
      const { navigation, dispatch } = this.props;
      this.setState({
        creatingBrightId: true,
      });
      if (name.length < 2) {
        this.setState({
          creatingBrightId: false,
        });
        return Alert.alert(
          'BrightID Form Incomplete',
          name.length === 0
            ? 'Please add your name'
            : 'Your name must be at least 2 characters',
        );
      }
      if (!finalBase64.uri) {
        this.setState({
          creatingBrightId: false,
        });
        return Alert.alert(
          'BrightID Form Incomplete',
          'A photo is required. Please press enter on the keyboard.',
        );
      }
      const result = await dispatch(
        handleBrightIdCreation({ photo: finalBase64, name }),
      );
      if (result) {
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

    return (
      <Container style={styles.container} behavior="padding">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F52828"
          translucent={false}
          animated={true}
        />
        <View style={styles.addPhotoContainer}>
          {finalBase64.uri && !editingName ? (
            <TouchableOpacity
              onPress={this.onAddPhoto}
              accessible={true}
              accessibilityLabel="edit photo"
            >
              <Image style={styles.photo} source={finalBase64} />
            </TouchableOpacity>
          ) : !editingName ? (
            <TouchableOpacity
              onPress={this.onAddPhoto}
              style={styles.addPhoto}
              accessible={true}
              accessibilityLabel="add photo"
            >
              <Text style={styles.addPhotoText}>Add Photo</Text>
              <SimpleLineIcons size={42} name="camera" color="#979797" />
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
        <View style={styles.textInputContainer}>
          <Text style={styles.midText}>What do your friends know you by?</Text>
          <TextInput
            onChangeText={(name) => this.setState({ name })}
            value={name}
            placeholder="Name"
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
                style={styles.createBrightIdButton}
                onPress={this.createBrightID}
              >
                <Text style={styles.buttonInnerText}>Create My BrightID</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('RecoveryCode')}
                style={styles.button}
                accessibilityLabel="Recover BrightID"
              >
                <Text style={styles.buttonText}>Recover BrightID</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loader}>
              <Text>Creating Bright ID...</Text>
              <Spinner isVisible={true} size={47} type="Wave" color="#4990e2" />
            </View>
          )}
        </View>
        <ActionSheet
          ref={(o) => {
            this.photoSheetRef = o;
          }}
          title="Select photo"
          options={['Take Photo', 'Choose From Library', 'cancel']}
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  addPhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  textInputContainer: {
    marginTop: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 28,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  addPhoto: {
    borderWidth: 1,
    borderColor: '#979797',
    height: 160,
    width: 160,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: 90,
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
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  midText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
  },
  textInput: {
    fontFamily: 'ApexNew-Light',
    fontSize: 28,
    fontWeight: '300',
    fontStyle: 'normal',
    letterSpacing: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9e9e9e',
    marginTop: 16,
    width: 275,
    textAlign: 'center',
    height: 60,
  },
  buttonInfoText: {
    fontFamily: 'ApexNew-Book',
    color: '#9e9e9e',
    fontSize: 14,
    width: 298,
    textAlign: 'center',
  },
  createBrightIdButton: {
    backgroundColor: '#428BE5',
    width: 260,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 9,
    marginTop: 22,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    width: 260,
    borderWidth: 1,
    borderColor: '#4990e2',
    paddingTop: 10,
    paddingBottom: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'ApexNew-Medium',
    color: '#4990e2',
    fontSize: 16,
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

export default connect()(SignUp);
