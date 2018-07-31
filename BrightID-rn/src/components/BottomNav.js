// @flow

import * as React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';

/**
 * list of icons which will navigate between screens inside the app
 * navigate between screens using the react-navigation
 * @prop navigation.navigate accepts param for linking to another screen
 * see AppRoutes.js for list of screens / routes in the app
 */

type Props = {
  navigation: { navigate: Function },
};

export default class BottomNav extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Home')}
          accessible={true}
          accessibilityLabel="Home"
        >
          <View style={styles.navIconContainer}>
            <Ionicon size={32} name="ios-home-outline" color="#000" />
            <Text style={styles.navText}>Home</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Connections')}
          accessible={true}
          accessibilityLabel="Connections"
        >
          <View style={styles.navIconContainer}>
            <Ionicon
              size={32}
              name="ios-git-pull-request-outline"
              color="#000"
            />
            <Text style={styles.navText}>Connections</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Groups')}
          accessible={true}
          accessibilityLabel="Groups"
        >
          <View style={styles.navIconContainer}>
            <Ionicon size={32} name="ios-contacts-outline" color="#000" />
            <Text style={styles.navText}>Groups</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => console.log('Notifications')}
          accessible={true}
          accessibilityLabel="Notifications"
        >
          <View style={styles.navIconContainer}>
            <Ionicon size={32} name="ios-notifications-outline" color="#000" />
            <Text style={styles.navText}>Notifications</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => console.log('Apps')}
          accessible={true}
          accessibilityLabel="Apps"
        >
          <View style={styles.navIconContainer}>
            <Ionicon size={32} name="ios-apps-outline" color="#000" />
            <Text style={styles.navText}>Apps</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 63,
    backgroundColor: '#F7F7F7',
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
});
