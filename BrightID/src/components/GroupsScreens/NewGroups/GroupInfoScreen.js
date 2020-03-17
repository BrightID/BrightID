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
import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import ToggleSwitch from 'toggle-switch-react-native'
import { chooseImage } from '@/utils/images';
import { DEVICE_TYPE, DEVICE_OS } from '@/utils/constants';

type State = {
  name: string,
  finalBase64: { uri: string },
  editingName: boolean,
  isPrimary: boolean
};

const Container = DEVICE_OS === 'ios' ? KeyboardAvoidingView : View;

export class GroupInfoScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'New Group',
    headerStyle: {
      backgroundColor: '#f48b1e',
    },
    headerShown: DEVICE_TYPE === 'large',
  };

  // eslint-disable-next-line react/state-in-constructor
  state = {
    name: '',
    finalBase64: { uri: '' },
    editingName: false,
    isPrimary: false
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

  hasPrimaryGroup = () => {
    const { groups } = this.props;
    return groups.some((group) => group.type == 'primary');
  };

  validateInputs = async () => {
    const { finalBase64, name, isPrimary } = this.state;
    const { navigation, dispatch } = this.props;
    if (name.length < 2) {
      return Alert.alert(
        'Group Form Incomplete',
        name.length === 0
          ? 'Please add a name for group'
          : 'The group name must be at least 2 characters',
      );
    }
    navigation.navigate('NewGroup', { photo: finalBase64, name, isPrimary });
  };

  render() {
    const { name, finalBase64, editingName, isPrimary } = this.state;

    return (
      <Container style={styles.container} behavior="padding">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F52828"
          translucent={false}
          animated={true}
        />
        <View style={{flexDirection:'row'}}>
          <View style={styles.addPhotoContainer}>
            {finalBase64.uri ? (
              <TouchableOpacity
                onPress={this.getPhotoFromLibrary}
                accessible={true}
                accessibilityLabel="edit photo"
              >
                <Image style={styles.photo} source={finalBase64} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={this.getPhotoFromLibrary}
                style={styles.addPhoto}
                accessible={true}
                accessibilityLabel="add photo"
              >
                <Text style={styles.addPhotoText}>Add Photo</Text>
                <SimpleLineIcons size={16} name="camera" color="#979797" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.textInputContainer}>
            <TextInput
              onChangeText={(name) => this.setState({ name })}
              value={name}
              placeholder="What is the group name?"
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
        </View>
        {! this.hasPrimaryGroup() && (
          <View style={styles.toggleContainer}>
            <Text style={styles.primaryGroupText}>
              A primary group represents the closest personal contacts (e.g. immediate family members)
              for a particular person. Each person can have only one primary group.
            </Text>
          
            <ToggleSwitch
              isOn={isPrimary}
              onColor="#428BE5"
              offColor="#979797"
              label="Primary Group"
              labelStyle={styles.primaryToggleLable}
              size="large"
              onToggle={isPrimary => this.setState({ isPrimary })}
            />
          </View>
        )}
        <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={this.validateInputs}
            >
              <Text style={styles.buttonInnerText}>Next</Text>
            </TouchableOpacity>
        </View>
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
  },
  buttonContainer: {
    marginTop: DEVICE_TYPE === 'large' ? 35 : 28,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  addPhoto: {
    borderWidth: 1,
    borderColor: '#979797',
    height: 72,
    width: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    marginBottom: 8,
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  textInput: {
    fontFamily: 'ApexNew-Light',
    fontSize: 20,
    fontWeight: '300',
    fontStyle: 'normal',
    letterSpacing: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#9e9e9e',
    marginTop: 8,
    height: 60,
    marginLeft: 10,
  },
  buttonInfoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
    width: 300,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#428BE5',
    width: DEVICE_TYPE === 'large' ? 285 : 260,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: DEVICE_TYPE === 'large' ? 14 : 10,
    paddingBottom: DEVICE_TYPE === 'large' ? 13 : 9,
    marginTop: 22,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: DEVICE_TYPE === 'large' ? 18 : 16,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  primaryToggleLable: {
    color: "#555555",
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    width: 200
  },
  toggleContainer: {
    marginTop: 30,
    width: 300
  },
  primaryGroupText: {
    paddingTop: 30,
    paddingBottom: 30,
    width: 300,
    textAlign: 'justify',
  }
});

export default connect((state) => state)(GroupInfoScreen);
