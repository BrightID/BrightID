// @flow

import * as React from 'react';
import {
  AsyncStorage,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import { ImagePicker, Permissions } from 'expo';
import nacl from 'tweetnacl';
import ImagePicker from 'react-native-image-picker';
import { connect } from 'react-redux';
import HeaderButtons from 'react-navigation-header-buttons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { setUserData } from '../actions';

type Props = {
  dispatch: Function,
  navigation: { navigate: Function },
};

type State = {
  nameornym: string,
  inputActive: boolean,
  imagePicking: boolean,
  userAvatar: Object,
};

class SignUp extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'BrightID',
    headerBackTitle: 'SignUp',
    headerStyle: {
      backgroundColor: '#f48b1e',
    },
    headerRight: (
      <HeaderButtons IconComponent={Ionicons} iconSize={32} color="#fff">
        <HeaderButtons.Item
          title="help"
          iconName="ios-help-circle-outline"
          onPress={() => console.log('help')}
        />
      </HeaderButtons>
    ),
  };

  constructor(props) {
    super(props);
    this.state = {
      nameornym: '',
      inputActive: false,
      userAvatar: '',
      imagePicking: false,
    };
  }

  getAvatarPhoto = async () => {
    // for full documentation on the Image Picker api
    // see https://github.com/react-community/react-native-image-picker

    const options = {
      title: 'Select Avatar',
      mediaType: 'photo',
      noData: false,
      allowsEditing: true,
    };
    // loading UI to account for the delay after picking an image
    setTimeout(
      () =>
        this.setState({
          imagePicking: true,
        }),
      1000,
    );

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        setTimeout(
          () =>
            this.setState({
              imagePicking: false,
            }),
          1001,
        );
      } else if (response.error) {
        setTimeout(
          () =>
            this.setState({
              imagePicking: false,
            }),
          1001,
        );
        console.warn('ImagePicker Error: ', response.error);
      } else if (response.customButton === 'defaultAvatar') {
        this.setState({
          userAvatar: 'https://commons.wikimedia.org/wiki/File:PICA.jpg',
        });
        console.warn('User tapped custom button: ', response.customButton);
      } else {
        const imageData = { uri: `data:image/jpeg;base64,${response.data}` };

        this.setState({
          userAvatar: imageData,
          imagePicking: false,
        });
      }
    });
  };

  handleBrightIdCreation = async () => {
    try {
      const { userAvatar, nameornym } = this.state;
      const { dispatch, navigation } = this.props;

      if (!nameornym) {
        return alert('Please add your name or nym');
      }

      // create public / private key pair

      const { publicKey, secretKey } = nacl.sign.keyPair();

      const userData = {
        publicKey,
        secretKey,
        nameornym,
        userAvatar,
      };

      // save avatar photo base64 data, and user data in async storage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      // update redux store
      await dispatch(setUserData(userData));
      // navigate to home page
      navigation.navigate('App');
      // catch any errors with saving data or generating the public / private key
    } catch (err) {
      console.warn(err);
    }
  };

  render() {
    const { inputActive, imagePicking, nameornym, userAvatar } = this.state;

    const AddPhotoButton = userAvatar ? (
      <Image style={styles.avatar} source={userAvatar} />
    ) : (
      <TouchableOpacity onPress={this.getAvatarPhoto} style={styles.addPhoto}>
        <Text style={styles.addPhotoText}>Add Photo</Text>
        <Ionicons size={48} name="ios-camera-outline" color="#979797" />
      </TouchableOpacity>
    );

    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="default"
          backgroundColor={Platform.OS === 'ios' ? 'transparent' : '#000'}
          translucent={false}
        />
        <View style={inputActive ? styles.hidden : styles.addPhotoContainer}>
          {!imagePicking ? AddPhotoButton : <Text>waiting...</Text>}
        </View>
        <View style={styles.textInputContainer}>
          <Text style={styles.midText}>What do your friends know you by?</Text>
          <TextInput
            onChangeText={(nameornym) => this.setState({ nameornym })}
            value={nameornym}
            placeholder="Name or Nym"
            placeholderTextColor="#9e9e9e"
            style={styles.textInput}
            onFocus={() => this.setState({ inputActive: true })}
            onBlur={() => this.setState({ inputActive: false })}
            onEndEditing={() => this.setState({ inputActive: false })}
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
          <TouchableOpacity
            style={styles.createBrightIdButton}
            onPress={this.handleBrightIdCreation}
          >
            <Text style={styles.buttonInnerText}>Create My BrightID</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 54,
    // borderWidth: 1
  },
  textInputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // borderWidth: 1
  },
  addPhoto: {
    // borderWidth: StyleSheet.hairlineWidth,
    borderWidth: 1,
    borderColor: '#979797',
    height: 183,
    width: 183,
    borderRadius: 91.5,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});

export default connect(null)(SignUp);
