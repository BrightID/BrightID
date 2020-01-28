// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { addNewConnection } from './actions/addNewConnection';

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */

type State = {};

export class PreviewConnectionScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'New Connection',
    headerRight: () => <View />,
  };

  handleConfirmation = async () => {
    const { dispatch, navigation } = this.props;
    await dispatch(addNewConnection());
    navigation.navigate('ConnectSuccess');
  };

  render() {
    const {
      connectUserData: { photo, name },
    } = this.props;
    const image = photo
      ? { uri: photo }
      : require('../../static/default_avatar.jpg');
    return (
      <View style={styles.container}>
        <View style={styles.questionTextContainer}>
          <Text style={styles.questionText}>Is this who you are trying</Text>
          <Text style={styles.questionText}>to connect with?</Text>
        </View>
        <View style={styles.userContainer}>
          <Image
            source={image}
            style={styles.photo}
            resizeMode="cover"
            onError={(e) => {
              console.log(e);
            }}
            accessible={true}
            accessibilityLabel="user photo"
          />
          <Text style={styles.connectName}>{name}</Text>
        </View>
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity
            onPress={this.handleConfirmation}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>Confirm Connection</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  questionTextContainer: {
    // flex: 1,
    marginTop: 83,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  userContainer: {
    // flex: 1,
    // marginTop: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 148,
    height: 148,
    borderRadius: 74,
  },
  connectName: {
    fontFamily: 'ApexNew-Book',
    marginTop: 15,
    fontSize: 30,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.32)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  confirmButtonContainer: {
    // flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    width: '82%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
  },
  confirmButtonText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
});

export default connect((state) => state)(PreviewConnectionScreen);
