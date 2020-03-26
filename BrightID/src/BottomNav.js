// @flow

import * as React from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { connect } from 'react-redux';
import { DEVICE_TYPE } from '@/utils/constants';
import { navigate } from './NavigationService';
/**
 * list of icons which will navigate between screens inside the app
 * navigate between screens using the react-navigation
 * @prop navigation.navigate accepts param for linking to another screen
 * see AppRoutes.js for list of screens / routes in the app
 */

const ICON_WIDTH = DEVICE_TYPE === 'small' ? 26 : 32;

type State = {
  keyboardShown: boolean,
};

export class BottomNav extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      keyboardShown: false,
    };
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        this.setState({ keyboardShown: true });
      },
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        this.setState({ keyboardShown: false });
      },
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  render() {
    const { keyboardShown } = this.state;
    const { notifications, invites, id } = this.props;
    const activeInvites = invites
      ? invites.filter((invite) => invite.state === 'active')
      : [];
    return id && !keyboardShown ? (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            navigate('Home');
          }}
          accessible={true}
          accessibilityLabel="Home"
        >
          <View style={styles.navIconContainer}>
            <SimpleLineIcons size={ICON_WIDTH} name="home" color="#222" />
            <Text style={styles.navText}>Home</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigate('Connections');
          }}
          accessible={true}
          accessibilityLabel="Connections"
        >
          <View style={styles.navIconContainer}>
            <SimpleLineIcons size={ICON_WIDTH} name="people" color="#222" />
            <Text style={styles.navText}>Connections</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigate('Groups');
          }}
          accessible={true}
          accessibilityLabel="Groups"
        >
          <View style={styles.navIconContainer}>
            <SimpleLineIcons
              size={ICON_WIDTH}
              name="organization"
              color="#222"
            />
            <Text style={styles.navText}>Groups</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigate('Notifications');
          }}
          accessible={true}
          accessibilityLabel="Notifications"
        >
          <View style={styles.navIconContainer}>
            {notifications.length + activeInvites.length > 0 && (
              <Text style={styles.badge}>
                {' '}
                {notifications.length + activeInvites.length}{' '}
              </Text>
            )}
            <SimpleLineIcons size={ICON_WIDTH} name="bell" color="#222" />
            <Text style={styles.navText}>Notifications</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigate('Apps');
          }}
          accessible={true}
          accessibilityLabel="Apps"
        >
          <View style={styles.navIconContainer}>
            <SimpleLineIcons size={ICON_WIDTH} name="layers" color="#222" />
            <Text style={styles.navText}>Apps</Text>
          </View>
        </TouchableOpacity>
      </View>
    ) : (
      <View />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: DEVICE_TYPE === 'small' ? 55 : 63,
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, .3)',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  navIconContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 12,
    marginBottom: 1.5,
  },
  badge: {
    color: '#fff',
    position: 'absolute',
    zIndex: 10,
    top: 1,
    right: 1,
    padding: 1,
    backgroundColor: 'red',
    borderRadius: 5,
  },
});

export default connect((state) => state)(BottomNav);
