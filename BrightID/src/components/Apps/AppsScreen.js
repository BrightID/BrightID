// @flow

import * as React from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  View,
  FlatList,
  Text,
  StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import EmptyList from '@/components/Helpers/EmptyList';
import Spinner from 'react-native-spinkit';
import { ORANGE, DEVICE_LARGE } from '@/utils/constants';
import { find, propEq } from 'ramda';
import AppCard from './AppCard';
import { handleAppContext } from './model';

export class AppsScreen extends React.Component<Prop, State> {
  componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('focus', async () => {
      this.handleDeepLink();
      Linking.addEventListener('url', this.handleDeepLink);
    });
    navigation.addListener('blur', async () => {
      Linking.removeEventListener('url', this.handleDeepLink);
    });
  }

  isValidContext = (context) => {
    const { apps } = this.props;
    const app = find(propEq('context', context))(apps);
    return app !== undefined;
  };

  handleDeepLink = () => {
    const { route, navigation } = this.props;
    console.log('params', route.params);
    if (route.params?.context) {
      const { context } = route.params;
      if (this.isValidContext(context)) {
        handleAppContext(route.params);
      } else {
        Alert.alert('Failed', `${context} is not a valid context!`);
      }
    }
    // reset params
    navigation.setParams({
      baseUrl: '',
      context: '',
      contextId: '',
    });
  };

  statusBar = () => {
    const { isSponsored, linkedApps } = this.props;
    const pendingLink = find(propEq('state', 'pending'))(linkedApps);
    let msg, waiting;
    if (pendingLink) {
      msg = `Linking your account in ${pendingLink.context}\n to your BrightID ...`;
      waiting = true;
    } else if (!isSponsored) {
      msg = "You're not sponsored.\nPlease find an app below to sponsor you.";
      waiting = false;
    } else {
      msg = '';
      waiting = false;
    }
    return msg.length > 0 ? (
      <View style={styles.statusContainer}>
        <Text style={styles.statusMessage}>{msg}</Text>
        <Spinner isVisible={waiting} size={48} type="Wave" color="#4a90e2" />
      </View>
    ) : (
      <View />
    );
  };

  isLinked = (app) => {
    const { linkedApps } = this.props;
    let linked = false;
    linkedApps.forEach((link) => {
      if (link.state === 'applied' && link.context === app.context) {
        linked = true;
      }
    });
    return linked;
  };

  render() {
    const { apps } = this.props;
    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor={ORANGE}
          animated={true}
        />
        <View style={styles.orangeTop} />
        <View style={styles.container} testID="appsScreen">
          <this.statusBar />
          <FlatList
            data={apps}
            contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
            keyExtractor={({ name }, index) => name + index}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <AppCard {...item} isLinked={this.isLinked(item)} />
            )}
            ListEmptyComponent={<EmptyList title="No Apps" iconType="flask" />}
          />
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  centerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  statusMessage: {
    fontFamily: 'ApexNew-Medium',
    textAlign: 'center',
    fontSize: 18,
    color: '#4a90e2',
  },
  linkingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default connect(({ apps }) => ({ ...apps }))(AppsScreen);
