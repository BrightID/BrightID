// @flow

import * as React from 'react';
import {
  Alert,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import HeaderButtons, {
  HeaderButton,
  Item,
} from 'react-navigation-header-buttons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { handleBrightIdCreation } from './actions';
import { mimeFromUri } from '../../utils/images';

type Props = {
  dispatch: () => null,
  navigation: { navigate: () => null },
};

type State = {
  nameornym: string,
  inputActive: boolean,
  imagePicking: boolean,
  avatar: Object,
};

// header Button
const IoniconsHeaderButton = (passMeFurther) => (
  // the `passMeFurther` variable here contains props from <Item .../> as well as <HeaderButtons ... />
  // and it is important to pass those props to `HeaderButton`
  // then you may add some information like icon size or color (if you use icons)
  <HeaderButton
    {...passMeFurther}
    IconComponent={Ionicons}
    iconSize={32}
    color="#fff"
  />
);

class SignUp extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'BrightID',
    headerBackTitle: 'SignUp',
    headerStyle: {
      backgroundColor: '#f48b1e',
    },
    headerRight: (
      <HeaderButtons HeaderButtonComponent={IoniconsHeaderButton}>
        <Item
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
      avatar: '',
      imagePicking: false,
      creatingBrightId: false,
    };
  }

  getAvatarPhoto = () => {
    // for full documentation on the Image Picker api
    // see https://github.com/react-community/react-native-image-picker

    const options = {
      title: 'Select Avatar',
      mediaType: 'photo',
      maxWidth: 180,
      maxHeight: 180,
      quality: 0.8,
      allowsEditing: true,
      loadingLabelText: 'loading avatar photo...',
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
        Alert.alert('ERROR', response.error);
        setTimeout(
          () =>
            this.setState({
              imagePicking: false,
            }),
          1001,
        );
      } else {
        const mime = mimeFromUri(response.uri);
        const imageData = {
          uri: `data:${mime};base64,${response.data}`,
        };
        this.setState({
          avatar: imageData,
          imagePicking: false,
        });
      }
    });
  };

  handleBrightIdCreation = async () => {
    try {
      const { avatar, nameornym } = this.state;
      const { navigation, dispatch } = this.props;
      this.setState({
        creatingBrightId: true,
      });
      const result = await dispatch(
        handleBrightIdCreation({ avatar, nameornym }),
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

  renderButtonOrSpinner = () =>
    !this.state.creatingBrightId ? (
      <TouchableOpacity
        style={styles.createBrightIdButton}
        onPress={this.handleBrightIdCreation}
      >
        <Text style={styles.buttonInnerText}>Create My BrightID</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.loader}>
        <Text>Generating fake user content...</Text>
        <Spinner isVisible={true} size={47} type="Wave" color="#4990e2" />
      </View>
    );

  render() {
    const { inputActive, imagePicking, nameornym, avatar } = this.state;

    const AddPhotoButton = avatar ? (
      <TouchableOpacity
        onPress={this.getAvatarPhoto}
        accessible={true}
        accessibilityLabel="edit avatar photo"
      >
        <Image
          style={styles.avatar}
          source={avatar}
          onPress={this.getAvatarPhoto}
        />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={this.getAvatarPhoto}
        style={styles.addPhoto}
        accessible={true}
        accessibilityLabel="add avatar photo"
      >
        <Text style={styles.addPhotoText}>Add Photo</Text>
        <SimpleLineIcons size={48} name="camera" color="#979797" />
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
          {!imagePicking ? (
            AddPhotoButton
          ) : (
            <Spinner
              style={styles.spinner}
              isVisible={true}
              size={79}
              type="Bounce"
              color="#4990e2"
            />
          )}
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
          {this.renderButtonOrSpinner()}
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
  },
  buttonContainer: {
    flex: 1,
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
  avatar: {
    width: 174,
    height: 174,
    borderRadius: 87,
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
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },

  cameraIcon: {
    width: 48,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default connect(null)(SignUp);
