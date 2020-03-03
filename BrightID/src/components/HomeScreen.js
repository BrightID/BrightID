// @flow

import * as React from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { connect } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VerificationSticker from './Verifications/VerificationSticker';
import { setPhoto, setName } from '@/actions';
import { getNotifications } from '@/actions/notifications';
import { delStorage } from '@/utils/dev';
import { chooseImage, takePhoto } from '@/utils/images';
import { saveImage, retrieveImage } from '@/utils/filesystem';
import { DEVICE_TYPE } from '@/utils/constants';
import fetchUserInfo from '@/actions/fetchUserInfo';
/**
 * Home screen of BrightID
 * ==========================
 */

type State = {
  profilePhoto: string,
  isEditing: boolean,
  name: string,
};

let chatSheetRef = '';
let discordUrl = 'https://discord.gg/nTtuB2M';

export class HomeScreen extends React.Component<Props, State> {
  photoSheetRef: string;

  static navigationOptions = ({ navigation }) => ({
    title: 'BrightID',
    headerBackTitle: 'Home',
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 11 }}
        onPress={delStorage(navigation)}
      >
        <Material size={32} name="dots-horizontal" color="#fff" />
      </TouchableOpacity>
    ),
    headerLeft: () => (
      <TouchableOpacity
        style={{ marginLeft: 16 }}
        onPress={() => {
          chatSheetRef.show();
        }}
      >
        <Ionicons name="ios-chatboxes" size={32} color="#fff" />
      </TouchableOpacity>
    ),
  });

  // eslint-disable-next-line react/state-in-constructor
  state = {
    profilePhoto: ' ',
    isEditing: false,
    name: '',
  };

  componentDidMount() {
    const { navigation, dispatch, photo, name } = this.props;
    navigation.addListener('didFocus', () => {
      dispatch(getNotifications());
      dispatch(fetchUserInfo());
    });
    retrieveImage(photo.filename).then((profilePhoto) => {
      this.setState({ profilePhoto });
    });
    this.setState({
      name,
    });
  }

  getPhotoFromCamera = async () => {
    try {
      const { id } = this.props;
      const { mime, data } = await takePhoto();
      const uri = `data:${mime};base64,${data}`;
      const filename = await saveImage({
        imageName: id,
        base64Image: uri,
      });
      setPhoto({ filename });
      const profilePhoto = await retrieveImage(filename);
      this.setState({
        profilePhoto,
      });
    } catch (err) {
      console.log(err);
    }
  };

  getPhotoFromLibrary = async () => {
    try {
      const { id } = this.props;
      const { mime, data } = await chooseImage();
      const uri = `data:${mime};base64,${data}`;
      const filename = await saveImage({
        imageName: id,
        base64Image: uri,
      });
      setPhoto({ filename });
      const profilePhoto = await retrieveImage(filename);
      this.setState({
        profilePhoto,
      });
    } catch (err) {
      console.log(err);
    }
  };

  onEditPhoto = () => {
    this.photoSheetRef.show();
  };

  render() {
    const {
      navigation,
      score,
      groupsCount,
      connections,
      // verifications,
    } = this.props;
    let verifications = ['BrightID'];
    const { profilePhoto } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.photoContainer}>
          {!this.state.isEditing ? (
            <TouchableOpacity
              onPress={this.onEditPhoto}
              accessible={true}
              accessibilityLabel="edit photo"
            >
              <Image
                source={{
                  uri: profilePhoto,
                }}
                style={styles.photo}
                resizeMode="cover"
                onError={(e) => {
                  console.log(e.error);
                }}
                accessible={true}
                accessibilityLabel="user photo"
              />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {this.state.isEditing ? (
            <TextInput
              value={this.state.name}
              style={{ ...styles.name, ...styles.editingName }}
              onChangeText={(text) => this.setState({ name: text })}
              autoFocus
              onBlur={() => {
                if (this.state.name.length >= 2) {
                  this.props.dispatch(setName(this.state.name));
                  this.setState({ isEditing: false });
                } else {
                  this.setState({
                    isEditing: false,
                    name: this.props.name,
                  });
                }
              }}
            />
          ) : (
            <Text
              style={styles.name}
              onPress={() => this.setState({ isEditing: true })}
            >
              {this.props.name}
            </Text>
          )}
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLeft}>Score:</Text>
          <Text id="score" style={styles.scoreRight}>
            {score}
          </Text>
        </View>

        <View style={styles.countsContainer}>
          <View style={styles.countsGroup}>
            <Text id="connectionsCount" style={styles.countsNumberText}>
              {connections.length}
            </Text>
            <Text style={styles.countsDescriptionText}>Connections</Text>
          </View>
          <View style={styles.countsGroup}>
            <Text id="groupsCount" style={styles.countsNumberText}>
              {groupsCount}
            </Text>
            <Text style={styles.countsDescriptionText}>Groups</Text>
          </View>
        </View>

        <View style={styles.verificationsContainer}>
          {verifications.map((name) => (
            <VerificationSticker name={name} key={name} />
          ))}
        </View>

        <View style={styles.connectContainer}>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => {
              navigation.navigate('NewConnection');
            }}
            accessible={true}
            accessibilityLabel="Connect"
          >
            <Material name="qrcode-scan" size={26} color="#fff" />
            <Text style={styles.connectText}>New Connection</Text>
          </TouchableOpacity>
        </View>

        <ActionSheet
          ref={(o) => {
            chatSheetRef = o;
          }}
          title="Like to chat with us?"
          options={['BrightID Discord', 'cancel']}
          cancelButtonIndex={1}
          onPress={(index) => {
            if (index === 0) {
              Linking.openURL(discordUrl).catch((err) =>
                console.error('An error occurred', err),
              );
            }
          }}
        />
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
      </View>
    );
  }
}

const PHOTO_WIDTH = DEVICE_TYPE === 'small' ? 130 : 142;
const NUMBER_SIZE = DEVICE_TYPE === 'small' ? 16 : 22;
const DESC_SIZE = DEVICE_TYPE === 'small' ? 12 : 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  photoContainer: {
    marginTop: DEVICE_TYPE === 'small' ? 10 : 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: PHOTO_WIDTH,
    height: PHOTO_WIDTH,
    borderRadius: 71,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'small' ? 26 : 30,
    marginTop: 8,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.32)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  editingName: {
    minWidth: 180,
  },
  verificationsContainer: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: DEVICE_TYPE === 'small' ? 0 : 10,
    width: '100%',
  },
  verificationSticker: {},
  connectContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    flex: 1,
    marginTop: DEVICE_TYPE === 'small' ? 0 : 17,
    flexDirection: 'row',
  },
  scoreContainer: {
    borderBottomColor: '#e3e1e1',
    borderBottomWidth: 1,
    width: '80%',
    marginTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: DESC_SIZE,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#9b9b9b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    paddingTop: 3.5,
  },
  scoreRight: {
    fontFamily: 'ApexNew-Medium',
    fontSize: NUMBER_SIZE,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#139c60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countsContainer: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    width: '80%',
    marginTop: 10,
    borderBottomColor: '#e3e1e1',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  countsDescriptionText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: DESC_SIZE,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  countsNumberText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: NUMBER_SIZE,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  countsGroup: {
    flex: 1,
  },
  connectButton: {
    paddingTop: 13,
    paddingBottom: 12,
    width: '80%',
    borderRadius: 6,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 20, height: 20 },
    shadowRadius: 20,
    elevation: 1,
  },
  connectText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: DEVICE_TYPE === 'small' ? 16 : 22,
    color: '#fff',
    marginLeft: 18,
  },
});

export default connect((state) => state)(HomeScreen);
