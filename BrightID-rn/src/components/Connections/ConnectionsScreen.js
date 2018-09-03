// @flow

import * as React from 'react';
import {
  Alert,
  AsyncStorage,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-spinkit';
import HeaderButtons, {
  HeaderButton,
  Item,
} from 'react-navigation-header-buttons';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';

import Ionicon from 'react-native-vector-icons/Ionicons';
import store from '../../store';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';
import { removeConnection, setConnections } from '../../actions';
import { addConnection } from '../../actions/fakeContact';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

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
  connections: Array<{
    nameornym: string,
    id: number,
  }>,
  searchParam: string,
};

class ConnectionsScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Connections',
    headerRight: (
      <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
        <Item
          title="options"
          iconName="dots-horizontal"
          onPress={() => {
            Alert.alert(
              'New Connection',
              'Would you like simulate adding a new connection?',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Sure',
                  onPress: () => {
                    store.dispatch(addConnection());
                    navigation.navigate('PreviewConnection');
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

  componentDidMount() {
    this.getConnections();
  }

  getConnections = async () => {
    try {
      const { dispatch } = this.props;
      /**
       * obtain connection keys from async storage
       * currently everything in async storage except for `userData` is a connection
       *
       * THIS MIGHT CHANGE WHEN GROUPS ARE ADDED
       */

      const allKeys = await AsyncStorage.getAllKeys();
      const connectionKeys = allKeys.filter((val) => val !== 'userData');
      const storageValues = await AsyncStorage.multiGet(connectionKeys);
      const connections = storageValues.map((val) => JSON.parse(val[1]));
      // update redux store
      dispatch(setConnections(connections));
    } catch (err) {
      console.log(err);
    }
  };

  handleUserOptions = (publicKey) => () => {
    const { nameornym } = this.props;
    Alert.alert(
      'Delete connection',
      `Are you sure you want to remove ${nameornym} from your list of connections? Your decision is irreversable.`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: this.removeUser(publicKey) },
      ],
      { cancelable: true },
    );
  };

  removeUser = (publicKey) => async () => {
    try {
      const { dispatch } = this.props;
      // update redux store
      dispatch(removeConnection(publicKey));
      // remove connection from async storage
      await AsyncStorage.removeItem(publicKey.toString());
    } catch (err) {
      console.log(err);
    }
  };

  filterConnections = () => {
    const { connections, searchParam } = this.props;
    return connections.filter((item) =>
      `${item.nameornym}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(searchParam.toLowerCase().replace(/\s/g, '')),
    );
  };

  renderActionComponent = (publicKey) => (
    <TouchableOpacity
      style={styles.moreIcon}
      onPress={this.handleUserOptions(publicKey)}
    >
      <Ionicon size={48} name="ios-more" color="#ccc" />
    </TouchableOpacity>
  );

  renderConnection = ({ item }) => (
    <ConnectionCard
      {...item}
      renderActionComponent={this.renderActionComponent}
    />
  );

  renderList = () => {
    const { connections } = this.props;
    if (connections.length > 0) {
      return (
        <FlatList
          style={styles.connectionsContainer}
          data={this.filterConnections()}
          keyExtractor={({ publicKey }, index) => publicKey.toString() + index}
          renderItem={this.renderConnection}
        />
      );
    } else {
      return (
        <Spinner
          style={styles.spinner}
          isVisible={true}
          size={47}
          type="WanderingCubes"
          color="#4990e2"
        />
      );
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <SearchConnections navigation={this.props.navigation} />
        <View style={styles.mainContainer}>{this.renderList()}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  connectionsContainer: {
    flex: 1,
  },
  mainContainer: {
    marginTop: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default connect((state) => state.main)(ConnectionsScreen);
