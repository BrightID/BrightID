// @flow

import * as React from 'react';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import HeaderButtons, {
  HeaderButton,
  Item,
} from 'react-navigation-header-buttons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import BottomNav from './BottomNav';
import store from '../store';
import { removeUserData } from '../actions';

/**
 * Home screen of BrightID
 * ==========================
 */

// header Button
const SimpleLineIconsHeaderButton = (passMeFurther) => (
  // the `passMeFurther` variable here contains props from <Item .../> as well as <HeaderButtons ... />
  // and it is important to pass those props to `HeaderButton`
  // then you may add some information like icon size or color (if you use icons)
  <HeaderButton
    {...passMeFurther}
    IconComponent={SimpleLineIcons}
    iconSize={32}
    color="#fff"
  />
);

// header Button
const MaterialHeaderButton = (passMeFurther) => (
  // the `passMeFurther` variable here contains props from <Item .../> as well as <HeaderButtons ... />
  // and it is important to pass those props to `HeaderButton`
  // then you may add some information like icon size or color (if you use icons)
  <HeaderButton
    {...passMeFurther}
    IconComponent={Material}
    iconSize={32}
    color="#fff"
  />
);

type Props = {
  trustScore: string,
  groupsCount: number,
  nameornym: string,
  connections: Array<{}>,
  navigation: { navigate: Function },
  userAvatar: string,
};

export class HomeScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'BrightID',
    headerBackTitle: 'Home',
    headerRight: (
      <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
        <Item
          title="options"
          iconName="dots-horizontal"
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
                      console.log(err);
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
        left={true}
        HeaderButtonComponent={SimpleLineIconsHeaderButton}
      >
        <Item title="help" iconName="question" onPress={() => {}} />
      </HeaderButtons>
    ),
  });

  state = {
    connectionsCount: 0,
  };

  componentDidMount() {
    this.getConnectionsCount();
    console.log('HomeScreen Mounted');
  }

  componentWillUnmount() {
    console.log('Homescreen unmounting');
  }

  getConnectionsCount = async () => {
    // currently connections count is based on async storage keys - 1
    /**
     *
     * THIS MIGHT CHANGE WHEN GROUPS ARE ADDED
     */
    const allKeys = await AsyncStorage.getAllKeys();
    this.setState({
      connectionsCount: allKeys.length - 1,
    });
  };

  render() {
    const {
      navigation,
      nameornym,
      trustScore,
      connections,
      groupsCount,
      userAvatar,
    } = this.props;
    const { connectionsCount } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.userAvatarContainer}>
            <Image
              source={userAvatar || require('../static/default_avatar.jpg')}
              style={styles.userAvatar}
              resizeMode="cover"
              onError={(e) => {
                console.log(e.error);
              }}
              accessible={true}
              accessibilityLabel="user avatar image"
            />
            <Text id="nameornym" style={styles.nameornym}>
              {nameornym}
            </Text>
          </View>
          <View style={styles.trustScoreContainer}>
            <Text id="trustScore" style={styles.trustScore}>
              {trustScore}% Trusted
            </Text>
          </View>
          <View style={styles.countsContainer}>
            <View style={styles.countsGroup}>
              <Text id="connectionsCount" style={styles.countsNumberText}>
                {connectionsCount}
              </Text>
              <Text style={styles.countsDescriptionText}>Connections</Text>
            </View>
            <View style={styles.countsGroup}>
              <Text id="groupsCount" style={styles.countsNumberText}>
                {groupsCount || 0}
              </Text>
              <Text style={styles.countsDescriptionText}>Groups</Text>
            </View>
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
              <FontAwesome name="qrcode" size={26} color="#fff" />
              <Text style={styles.connectText}>New Connection</Text>
              <SimpleLineIcons name="plus" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
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

  userAvatarContainer: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 142,
    height: 142,
    borderRadius: 71,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  nameornym: {
    fontFamily: 'ApexNew-Book',
    fontSize: 30,
    marginTop: 8,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
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
  connectContainer: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e3e1e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
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
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
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
    // width: 138,
    // height: 138,
    height: 65,
    paddingTop: 13,
    paddingBottom: 12,
    width: '80%',
    backgroundColor: '#4990e2',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
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
