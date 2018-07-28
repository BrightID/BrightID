// @flow

import * as React from 'react';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import HeaderButtons from 'react-navigation-header-buttons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNav from './BottomNav';
import UserAvatar from './UserAvatar';
import store from '../store';
import { removeUserData } from '../actions';

/**
 * Home screen of BrightID
 */

type Props = {
  trustScore: string,
  groupsCount: number,
  name: string,
  connections: Array<{}>,
  navigation: { navigate: Function },
};

export class HomeScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'BrightID',
    headerBackTitle: 'Home',
    headerRight: (
      <HeaderButtons IconComponent={Ionicons} iconSize={32} color="#fff">
        <HeaderButtons.Item
          title="more"
          iconName="ios-more-outline"
          onPress={() => {
            Alert.alert(
              'WARNING',
              'Would you like to delete user data and return to the onboarding screen?',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Sure',
                  onPress: async () => {
                    try {
                      navigation.navigate('Onboarding');
                      await AsyncStorage.flushGetRequests();
                      await AsyncStorage.removeItem('userData');
                      store.dispatch(removeUserData());
                    } catch (err) {
                      console.warn(err);
                    }
                  },
                },
              ],
              { cancelable: true },
            );
          }}
        />
      </HeaderButtons>
    ),
    headerLeft: (
      <HeaderButtons
        IconComponent={Ionicons}
        iconSize={32}
        color="#fff"
        left={true}
      >
        <HeaderButtons.Item
          title="help"
          iconName="ios-help-circle-outline"
          onPress={() => {
            Alert.alert(
              'WARNING',
              'Would you like to delete user data and return to the onboarding screen?',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Sure',
                  onPress: async () => {
                    try {
                      navigation.navigate('Onboarding');
                      await AsyncStorage.flushGetRequests();
                      await AsyncStorage.removeItem('userData');
                      store.dispatch(removeUserData());
                    } catch (err) {
                      console.warn(err);
                    }
                  },
                },
              ],
              { cancelable: true },
            );
          }}
        />
      </HeaderButtons>
    ),
  });

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.user}>
            <UserAvatar />
            <Text id="nameornym" style={styles.name}>
              {this.props.name}
            </Text>
          </View>
          <View style={styles.trustScoreContainer}>
            <Text id="trustScore" style={styles.trustScore}>
              {this.props.trustScore}% Trusted
            </Text>
          </View>
          <View style={styles.countsContainer}>
            <View style={styles.countsGroup}>
              <Text id="connectionsCount" style={styles.countsNumberText}>
                {this.props.connections.length || 0}
              </Text>
              <Text style={styles.countsDescriptionText}>Connections</Text>
            </View>
            <View style={styles.countsGroup}>
              <Text id="groupsCount" style={styles.countsNumberText}>
                {this.props.groupsCount || 0}
              </Text>
              <Text style={styles.countsDescriptionText}>Groups</Text>
            </View>
          </View>

          <View style={styles.connectContainer}>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => {
                this.props.navigation.navigate('NewConnection');
              }}
            >
              <Text style={styles.connectText}>CONNECT</Text>
              <Material name="key-plus" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <BottomNav navigation={this.props.navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: "center",
    // flexDirection: "column",
    // justifyContent: "space-between"
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: 30,
    marginTop: 8,
    textAlign: 'center',
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  user: {
    marginTop: 24,
  },
  connectContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    flex: 1,
    marginTop: 17,
    flexDirection: 'row',
  },
  trustScoreContainer: {
    borderBottomColor: '#e3e1e1',
    borderTopColor: '#e3e1e1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    width: '80%',
    marginTop: 9,
    paddingTop: 7,
    paddingBottom: 7,
  },

  trustScore: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    textAlign: 'center',
    color: 'green',
  },
  countsContainer: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    width: '75%',
    marginTop: 12,
  },
  countsDescriptionText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 16,
  },
  countsNumberText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 22,
  },
  countsGroup: {
    flex: 1,
  },
  connectButton: {
    width: 138,
    height: 138,
    backgroundColor: '#4990e2',
    borderRadius: 69,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 20, height: 20 },
    shadowRadius: 20,
    elevation: 1,
  },
  connectText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
});

export default connect((state) => state.main)(HomeScreen);
