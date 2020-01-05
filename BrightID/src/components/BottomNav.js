// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { connect } from 'react-redux';

/**
 * list of icons which will navigate between screens inside the app
 * navigate between screens using the react-navigation
 * @prop navigation.navigate accepts param for linking to another screen
 * see AppRoutes.js for list of screens / routes in the app
 */

type Props = {
  navigation: navigation,
  notifications: Array<NotificationInfo>,
};

export class BottomNav extends React.Component<Props> {
  render() {
    const { notifications, navigation } = this.props;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Home');
          }}
          accessible={true}
          accessibilityLabel="Home"
        >
          <View style={styles.navIconContainer}>
            <SimpleLineIcons size={32} name="home" color="#222" />
            <Text style={styles.navText}>Home</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Connections');
          }}
          accessible={true}
          accessibilityLabel="Connections"
        >
          <View style={styles.navIconContainer}>
            <SimpleLineIcons size={32} name="people" color="#222" />
            <Text style={styles.navText}>Connections</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Groups');
          }}
          accessible={true}
          accessibilityLabel="Groups"
        >
          <View style={styles.navIconContainer}>
            <SimpleLineIcons size={32} name="organization" color="#222" />
            <Text style={styles.navText}>Groups</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Notifications');
          }}
          accessible={true}
          accessibilityLabel="Notifications"
        >
          <View style={styles.navIconContainer}>
            {notifications.length > 0 && (
              <Text style={styles.badge}> {notifications.length} </Text>
            )}
            <SimpleLineIcons size={32} name="bell" color="#222" />
            <Text style={styles.navText}>Notifications</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Apps');
          }}
          accessible={true}
          accessibilityLabel="Apps"
        >
          <View style={styles.navIconContainer}>
            <SimpleLineIcons size={32} name="layers" color="#222" />
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
