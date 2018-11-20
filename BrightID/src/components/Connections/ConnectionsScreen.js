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
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';
import { removeConnection, setConnections } from '../../actions';
import { defaultSort } from './sortingUtility';
import { objToUint8 } from '../../utils/encoding';
import { createNewConnection } from './createNewConnection';
import emitter from '../../emitter';
import BottomNav from '../BottomNav';

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
          onPress={createNewConnection(navigation)}
        />
      </HeaderButtons>
    ),
  });

  componentDidMount() {
    this.getConnections();
    emitter.on('refreshConnections', this.getConnections);
    emitter.on('removeConnection', this.removeConnection);
  }

  componentWillUnmount() {
    emitter.off('refreshConnections', this.getConnections);
    emitter.off('removeConnection', this.removeConnection);
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
      const connectionValues = storageValues.map((val) => JSON.parse(val[1]));
      const connections = connectionValues.map((val) => {
        val.publicKey = objToUint8(val.publicKey);
        return val;
      });
      // update redux store
      dispatch(setConnections(connections));
      // sort connections
      dispatch(defaultSort());
    } catch (err) {
      console.log(err);
    }
  };

  removeConnection = async (publicKey) => {
    try {
      // remove connection from async storage
      await AsyncStorage.removeItem(JSON.stringify(publicKey));
      emitter.emit('refreshConnections', {});
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
          keyExtractor={({ publicKey }, index) =>
            JSON.stringify(publicKey) + index
          }
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
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <SearchConnections navigation={this.props.navigation} />
          <View style={styles.mainContainer}>{this.renderList()}</View>
        </View>
        <BottomNav navigation={navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  connectionsContainer: {
    flex: 1,
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default connect((state) => state.main)(ConnectionsScreen);
