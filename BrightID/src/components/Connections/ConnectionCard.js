// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import moment from 'moment';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE, MAX_WAITING_SECONDS } from '@/utils/constants';
import AntDesign from 'react-native-vector-icons/AntDesign';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop connectionTime
 * @prop photo
 */

const ICON_SIZE = DEVICE_LARGE ? 22 : 18;

type State = {
  isStale: boolean,
};

class ConnectionCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isStale: false,
    };
    this.stale_check_timer = 0;
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
        console.log(`Marking connection as stale in ${checkTime}ms.`);
        clearTimeout(this.stale_check_timer);
        this.stale_check_timer = setTimeout(() => {
          if (this.checkStale()) {
            this.setState({ isStale: true });
          }
        }, checkTime);
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.stale_check_timer &&
      prevProps.status === 'initiated' &&
      this.props.status === 'verified'
    ) {
      console.log(
        `Connection ${this.props.name} changed 'initiated' -> 'verified'. Stopping stale_check_timer ID ${this.stale_check_timer}.`,
      );
      clearTimeout(this.stale_check_timer);
      this.stale_check_timer = 0;
    }
  }

  componentWillUnmount() {
    // clear timer if it is set
    if (this.stale_check_timer) {
      clearTimeout(this.state.stale_check_timer);
      this.stale_check_timer = 0;
    }
  }

  checkStale = () => {
    const { connectionDate, name } = this.props;
    const ageSeconds = Math.floor((Date.now() - connectionDate) / 1000);
    if (ageSeconds > MAX_WAITING_SECONDS) {
      console.log(`Connection ${name} is stale (age: ${ageSeconds} seconds)`);
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

  getStatus = () => {
    const { isStale } = this.state;
    const { status, connectionDate } = this.props;
    if (status === 'initiated') {
      const statusText = isStale
        ? 'Connection failed.\nPlease try again.'
        : 'Waiting';
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.waitingMessage}>{statusText}</Text>
        </View>
      );
    } else if (status === 'deleted') {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.deletedMessage}>Deleted</Text>
        </View>
      );
    } else {
      return (
        <Text style={styles.connectedText}>
          Connected {moment(parseInt(connectionDate, 10)).fromNow()}
        </Text>
      );
    }
  };

  getContextAction = () => {
    const { status, photo } = this.props;
    const { isStale } = this.state;
    if (status === 'verified') {
      return (
        <TouchableOpacity
          testID="flagConnectionBtn"
          style={styles.moreIcon}
          onPress={this.handleUserOptions}
        >
          <Material size={ICON_SIZE} name="close" color="#aaa" />
        </TouchableOpacity>
      );
    }
    // photo is added here due to bug discovered 6/29/20
    if (status === 'deleted' || (status === 'initiated' && isStale) || !photo) {
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
    const { photo, name, style, navigation } = this.props;
    const connectionStatus = this.getStatus();
    const contextAction = this.getContextAction();

    return (
      <View style={{ ...styles.container, ...style }}>
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('FullScreenPhoto', { photo });
            }}
            accessibilityLabel="View Photo Full Screen"
            accessibilityRole="imagebutton"
          >
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/photos/${photo?.filename}`,
              }}
              style={styles.photo}
              accessibilityLabel="ConnectionPhoto"
            />
          </TouchableOpacity>
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            {connectionStatus}
          </View>
          {/* {contextAction} */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: DEVICE_LARGE ? 100 : 92,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  card: {
    width: '90%',
    height: 71,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: 'rgba(221, 179, 169, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    borderTopLeftRadius: DEVICE_LARGE ? 12 : 10,
    borderBottomLeftRadius: DEVICE_LARGE ? 12 : 10,
  },
  photo: {
    borderRadius: 55,
    width: DEVICE_LARGE ? 65 : 55,
    height: DEVICE_LARGE ? 65 : 55,
    marginLeft: DEVICE_LARGE ? 14 : 12,
    marginTop: -30,
  },
  info: {
    marginLeft: DEVICE_LARGE ? 22 : 19,
    flex: 1,
    height: DEVICE_LARGE ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  connectedText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: '#B64B32',
    marginTop: DEVICE_LARGE ? 5 : 2,
  },
  moreIcon: {
    marginRight: DEVICE_LARGE ? 26 : 23,
  },
  waitingMessage: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#e39f2f',
    marginTop: DEVICE_LARGE ? 2 : 0,
  },
  deletedMessage: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#FF0800',
    marginTop: DEVICE_LARGE ? 5 : 2,
  },
});

export default connect()(ConnectionCard);
