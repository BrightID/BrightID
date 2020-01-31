// @flow

import * as React from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { handleBrightIdCreation } from './actions';
import ResizeImage from '../../utils/ResizeImage';
import { selectImage } from '../../utils/images';

type State = {
  name: string,
  initialPhoto: { uri: string },
  finalBase64: { uri: string },
  creatingBrightId: boolean,
};

export class SignUp extends React.Component<Props, State> {
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
  };

  state = {
    name: '',
    initialPhoto: { uri: '' },
    finalBase64: { uri: '' },
    creatingBrightId: false,
  };

  getPhoto = async () => {
    try {
      const initialPhoto = await selectImage();
      this.setState({
        initialPhoto,
      });
    } catch (err) {
      console.log(err);
    }
  };

  onCapture = (uri: string) => {
    this.setState({ finalBase64: { uri } });
  };

  createBrightID = async () => {
    try {
      const { finalBase64, name } = this.state;
      const { navigation, dispatch } = this.props;
      this.setState({
        creatingBrightId: true,
      });
      if (!name) {
        this.setState({
          creatingBrightId: false,
        });
        return Alert.alert('BrightID Form Incomplete', 'Please add your name');
      }
      if (!finalBase64.uri) {
        this.setState({
          creatingBrightId: false,
        });
        return Alert.alert('BrightID Form Incomplete', 'A photo is required');
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
    const { name, initialPhoto, finalBase64, creatingBrightId } = this.state;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <StatusBar
          barStyle="default"
          backgroundColor={Platform.OS === 'ios' ? 'transparent' : '#000'}
          translucent={false}
        />
        <ResizeImage
          width={180}
          height={180}
          onCapture={this.onCapture}
          uri={initialPhoto.uri}
        />
        <View style={styles.addPhotoContainer}>
          {finalBase64.uri ? (
            <TouchableOpacity
              onPress={this.getPhoto}
              accessible={true}
              accessibilityLabel="edit photo"
            >
              <Image
                style={styles.photo}
                source={finalBase64}
                onPress={this.getPhoto}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={this.getPhoto}
              style={styles.addPhoto}
              accessible={true}
              accessibilityLabel="add photo"
            >
              <Text style={styles.addPhotoText}>Add Photo</Text>
              <SimpleLineIcons size={48} name="camera" color="#979797" />
            </TouchableOpacity>
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
      </KeyboardAvoidingView>
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
    marginTop: 44,
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
  addPhoto: {
    borderWidth: 1,
    borderColor: '#979797',
    height: 180,
    width: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 180,
    height: 180,
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
    fontSize: 18,
  },
  textInput: {
    fontFamily: 'ApexNew-Light',
    fontSize: 36,
    fontWeight: '300',
    fontStyle: 'normal',
    letterSpacing: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9e9e9e',
    marginTop: 22,
    width: 275,
    textAlign: 'center',
    paddingBottom: 5,
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
  buttonText: {
    fontFamily: 'ApexNew-Medium',
    color: '#4990e2',
    fontSize: 18,
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
