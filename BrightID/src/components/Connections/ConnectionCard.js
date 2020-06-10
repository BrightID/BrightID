// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import moment from 'moment';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_TYPE, MAX_WAITING_SECONDS } from '@/utils/constants';
import AntDesign from 'react-native-vector-icons/AntDesign';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop score
 * @prop connectionTime
 * @prop photo
 */

const ICON_SIZE = DEVICE_TYPE === 'large' ? 36 : 32;

type State = {
  stale_check_timer: TimeoutID,
  isStale: boolean,
};

class ConnectionCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      stale_check_timer: 0,
      isStale: false,
    };
  }

  componentDidMount() {
    // if we have a "waiting" connection, start timer to handle stale connection requests
    const { status, connectionDate } = this.props;
    if (status === 'initiated') {
      if (this.checkStale()) {
        // this is already old. Immediately mark as "stale", no need for a timer.
        this.setState({ isStale: true });
      } else {
        // start timer to check if connection got verified after MAX_WAITING_TIME
        let checkTime =
          connectionDate + MAX_WAITING_SECONDS * 1000 + 5000 - Date.now(); // add 5 seconds buffer
        if (checkTime < 0) {
          console.log(`Warning - checkTime in past: ${checkTime}`);
          checkTime = 1000; // check in 1 second
        }
        console.log(`Checking connection state in ${checkTime}ms.`);
        clearTimeout(this.state.stale_check_timer);
        const stale_check_timer = setTimeout(() => {
          if (this.checkStale()) {
            this.setState({ isStale: true });
            clearTimeout(this.state.stale_check_timer);
          }
        }, checkTime);
        this.setState({ stale_check_timer });
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.state.stale_check_timer &&
      prevProps.status === 'initiated' &&
      this.props.status === 'verified'
    ) {
      console.log(
        `Connection ${this.props.name} changed to 'verified'. Stopping timer.`,
      );
      clearTimeout(this.state.stale_check_timer);
    }
  }

  componentWillUnmount() {
    // clear timer if it is set
    if (this.state.stale_check_timer) {
      clearTimeout(this.state.stale_check_timer);
    }
  }

  checkStale = () => {
    const { connectionDate, name } = this.props;
    const ageSeconds = Math.floor((Date.now() - connectionDate) / 1000);
    console.log(`Connection age: ${ageSeconds} seconds`);
    if (ageSeconds > MAX_WAITING_SECONDS) {
      console.log(`Connection ${name} is stale`);
      return true;
    }
    return false;
  };

  handleUserOptions = () => {
    const { actionSheet } = this.props;
    actionSheet.connection = this.props;
    actionSheet.show();
  };

  handleRemoveStaleConnection = () => {
    this.props.onRemove(this.props);
  };

  scoreColor = () => {
    const { score } = this.props;
    if (score >= 85) {
      return { color: '#139c60' };
    } else {
      return { color: '#e39f2f' };
    }
  };

  getStatus = () => {
    const { isStale } = this.state;
    const { score, status } = this.props;
    if (status === 'initiated') {
      let statusText = 'Waiting';
      if (isStale) {
        statusText = 'Connection failed. Please try again.';
      }
      return (
        <View style={styles.scoreContainer}>
          <Text style={styles.waitingMessage}>{statusText}</Text>
        </View>
      );
    } else if (status === 'verified') {
      return (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLeft}>Score:</Text>
          <Text style={[styles.scoreRight, this.scoreColor()]}>{score}</Text>
        </View>
      );
    } else if (status === 'deleted') {
      return (
        <View style={styles.scoreContainer}>
          <Text style={styles.deletedMessage}>Deleted</Text>
        </View>
      );
    } else {
      return <View style={styles.scoreContainer} />;
    }
  };

  getContextAction = () => {
    const { status } = this.props;
    const { isStale } = this.state;
    if (status === 'verified') {
      return (
        <TouchableOpacity
          testID="flagConnectionBtn"
          style={styles.moreIcon}
          onPress={this.handleUserOptions}
        >
          <Material size={ICON_SIZE} name="flag-remove" color="#ccc" />
        </TouchableOpacity>
      );
    }
    if (status === 'deleted' || (status === 'initiated' && isStale)) {
      return (
        <TouchableOpacity
          testID="deleteConnectionBtn"
          style={styles.moreIcon}
          onPress={this.handleRemoveStaleConnection}
        >
          <AntDesign size={ICON_SIZE} name="closecircle" color="#ccc" />
        </TouchableOpacity>
      );
    }
    // default: No context action
    return null;
  };

  render() {
    const { photo, name, connectionDate, style } = this.props;
    const connectionStatus = this.getStatus();
    const contextAction = this.getContextAction();

    return (
      <View style={{ ...styles.container, ...style }}>
        <Image
          source={{
            uri: `file://${RNFS.DocumentDirectoryPath}/photos/${photo.filename}`,
          }}
          style={styles.photo}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {connectionStatus}
          <Text style={styles.connectedText}>
            Connected {moment(parseInt(connectionDate, 10)).fromNow()}
          </Text>
        </View>
        {contextAction}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    height: DEVICE_TYPE === 'large' ? 94 : 80,
    marginBottom: DEVICE_TYPE === 'large' ? 11.8 : 6,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  photo: {
    borderRadius: 30,
    width: 60,
    height: 60,
    marginLeft: 14,
  },
  info: {
    marginLeft: 25,
    flex: 1,
    height: DEVICE_TYPE === 'large' ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  scoreRight: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
  },
  flagged: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
    color: '#FF0800',
    marginLeft: 15,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 12,
    color: '#aba9a9',
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 26,
  },
  waitingMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
    color: '#e39f2f',
  },
  deletedMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
    color: '#FF0800',
  },
});

export default connect()(ConnectionCard);
