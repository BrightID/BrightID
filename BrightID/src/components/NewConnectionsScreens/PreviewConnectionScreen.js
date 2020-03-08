// @flow

import * as React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import { addNewConnection } from './actions/addNewConnection';
import api from '../../Api/BrightId';

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */

type State = {
  connections: number,
  groups: number,
  mutualConnections: number,
  connectionDate: string,
};

export class PreviewConnectionScreen extends React.Component<Props, State> {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    connections: 'loading',
    groups: 'loading',
    mutualConnections: 'loading',
    connectionDate: 'loading',
  };

  static navigationOptions = {
    title: 'New Connection',
    headerRight: () => <View />,
    // headerShown: false,
  };

  componentDidMount() {
    this.fetchConnectionInfo().done();
  }

  handleConfirmation = async () => {
    const { dispatch, navigation } = this.props;
    await dispatch(addNewConnection());
    navigation.navigate('ConnectSuccess');
  };

  reject = () => {
    const { navigation } = this.props;
    navigation.navigate('Home');
  };

  fetchConnectionInfo = async () => {
    const myConnections = this.props.connections;
    try {
      const {
        createdAt,
        currentGroups,
        connections = [],
      } = await api.getUserInfo(this.props.connectUserData.id);
      const mutualConnections = connections.filter(function(el) {
        return myConnections.some((x) => x.id == el.id);
      });
      this.setState({
        connections: connections.length,
        groups: currentGroups.length,
        mutualConnections: mutualConnections.length,
        connectionDate: `Created ${moment(parseInt(createdAt, 10)).fromNow()}`,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'User not found') {
        this.setState({
          connections: 0,
          groups: 0,
          mutualConnections: 0,
          connectionDate: 'New user',
        });
      } else {
        err instanceof Error ? console.warn(err.message) : console.log(err);
      }
    }
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
          <Text style={styles.questionText}>Connect with?</Text>
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
          <Text style={styles.connectedText}>{this.state.connectionDate}</Text>
        </View>
        <View style={styles.countsContainer}>
          <View style={styles.countsGroup}>
            <Text id="connectionsCount" style={styles.countsNumberText}>
              {this.state.connections}
            </Text>
            <Text style={styles.countsDescriptionText}>Connections</Text>
          </View>
          <View style={styles.countsGroup}>
            <Text id="groupsCount" style={styles.countsNumberText}>
              {this.state.groups}
            </Text>
            <Text style={styles.countsDescriptionText}>Groups</Text>
          </View>
          <View style={styles.countsGroup}>
            <Text id="groupsCount" style={styles.countsNumberText}>
              {this.state.mutualConnections}
            </Text>
            <Text style={styles.countsDescriptionText}>Mutual Connections</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this.reject} style={styles.rejectButton}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.handleConfirmation}
            style={styles.confirmButton}
          >
            <Text style={styles.buttonText}>Confirm</Text>
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
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  questionTextContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 26,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  userContainer: {
    marginTop: 10,
    paddingBottom: 10,
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
    marginTop: 10,
    fontSize: 26,
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
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    flex: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
  },
  rejectButton: {
    borderRadius: 3,
    backgroundColor: '#f7651c',
    flex: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
  },
  buttonText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  countsContainer: {
    borderTopColor: '#e3e1e1',
    borderTopWidth: 1,
    paddingTop: 11,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
    borderBottomColor: '#e3e1e1',
    borderBottomWidth: 1,
    paddingBottom: 11,
  },
  countsDescriptionText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  countsNumberText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#aba9a9',
    fontStyle: 'italic',
  },
});

export default connect((state) => state)(PreviewConnectionScreen);
