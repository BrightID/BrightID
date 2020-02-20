// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { connect } from 'react-redux';
import Overlay from 'react-native-modal-overlay';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import VerificationSticker from './Verifications/VerificationSticker';
import BottomNav from './BottomNav';
import { setPhoto } from '../actions';
import { getNotifications } from '../actions/notifications';
import { delStorage } from '../utils/dev';
import { chooseImage, takePhoto } from '../utils/images';
import { saveImage, retrieveImage } from '../utils/filesystem';

/**
 * Home screen of BrightID
 * ==========================
 */

type State = {
  profilePhoto: string,
  modalVisible: boolean,
};

export class HomeScreen extends React.Component<Props, State> {
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
      <TouchableOpacity style={{ marginLeft: 11 }} onPress={() => {}}>
        <SimpleLineIcons name="question" size={32} color="#fff" />
      </TouchableOpacity>
    ),
  });

  componentDidMount() {
    const { navigation, dispatch, photo } = this.props;
    navigation.addListener('willFocus', () => {
      dispatch(getNotifications());
    });
    retrieveImage(photo.filename).then((profilePhoto) => {
      this.setState({ profilePhoto });
    });
  }

  // eslint-disable-next-line react/state-in-constructor
  state = {
    profilePhoto: ' ',
    modalVisible: false,
  };

  // changePhoto = async () => {
  //   const { id } = this.props;
  //   try {
  //     const { mime, data } = await selectImage();
  //     const uri = `data:${mime};base64,${data}`;
  //     const filename = await saveImage({ imageName: id, base64Image: uri });
  //     console.log('filename', filename);
  //     setPhoto({ filename });
  //     const profilePhoto = await retrieveImage(filename);
  //     this.setState({
  //       profilePhoto,
  //     });
  //     // Image.getSize(`file://${RNFS.DocumentDirectoryPath}/photos/${filename}`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  getPhotoFromCamera = async () => {
    try {
      const { id } = this.props;
      const { mime, data } = await takePhoto();
      const uri = `data:${mime};base64,${data}`;
      const filename = await saveImage({ imageName: id, base64Image: uri });
      setPhoto({ filename });
      const profilePhoto = await retrieveImage(filename);
      this.setState({
        profilePhoto,
        modalVisible: false,
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
      const filename = await saveImage({ imageName: id, base64Image: uri });
      setPhoto({ filename });
      const profilePhoto = await retrieveImage(filename);
      this.setState({
        profilePhoto,
        modalVisible: false,
      });
    } catch (err) {
      console.log(err);
    }
  };

  onEditPhoto = () => {
    setTimeout(() => {
      this.setState({ modalVisible: true });
    }, 200);
  };

  onClose = () => {
    this.setState({ modalVisible: false });
  };

  render() {
    const {
      navigation,
      name,
      score,
      groupsCount,
      connections,
      verifications,
    } = this.props;

    const { profilePhoto } = this.state;
    return (
      <View style={styles.container}>
        <Overlay
          visible={this.state.modalVisible}
          onClose={this.onClose}
          closeOnTouchOutside
        >
          <View>
            <TouchableOpacity
              onPress={this.getPhotoFromCamera}
              style={styles.button}
              accessibilityLabel="Take Photo"
            >
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createBrightIdButton}
              onPress={this.getPhotoFromLibrary}
            >
              <Text style={styles.buttonInnerText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
        </Overlay>
        <View style={styles.mainContainer}>
          <View style={styles.photoContainer}>
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
            <Text id="name" style={styles.name}>
              {name}
            </Text>
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
        </View>

        <View style={styles.chatContainer}>
          <Text style={styles.chatText}
                onPress={() => Linking.openURL('https://discord.gg/nTtuB2M')}>
            BrightID Chat
          </Text>
          <Image source={require('../static/chat.png')}/>
        </View>

        <BottomNav navigation={navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  photoContainer: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 142,
    height: 142,
    borderRadius: 71,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: 30,
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
  verificationsContainer: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  chatContainer: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '100%',
  },
  chatText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 17,
    color: '#4a90e2',
    marginRight: 5,
    textDecorationLine: 'underline',
  },
  verificationSticker: {},
  connectContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 17,
    flexDirection: 'row',
  },
  scoreContainer: {
    borderBottomColor: '#e3e1e1',
    borderBottomWidth: 1,
    width: '80%',
    marginTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
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
    fontSize: 22,
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
    marginTop: 12,
    borderBottomColor: '#e3e1e1',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  countsDescriptionText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  countsNumberText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  countsGroup: {
    flex: 1,
  },
  connectButton: {
    height: 65,
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
    fontSize: 22,
    color: '#fff',
    marginLeft: 18,
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
    // marginBottom: 10,
  },
  buttonText: {
    fontFamily: 'ApexNew-Medium',
    color: '#4990e2',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
});

export default connect((state) => state)(HomeScreen);
