// @flow

import * as React from 'react';
import { AsyncStorage, StyleSheet, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import {
  HeaderButtons,
  HeaderButton,
  Item,
} from 'react-navigation-header-buttons';
// import {
//   Menu,
//   MenuOptions,
//   MenuOption,
//   MenuTrigger,
// } from 'react-native-popup-menu';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationEvents } from 'react-navigation';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';
import { getConnections } from '../../actions/connections';
import { createNewConnection } from './createNewConnection';
import emitter from '../../emitter';
import BottomNav from '../BottomNav';
import { renderListOrSpinner } from './renderConnections';
import api from '../../Api/BrightId';
import FloatingActionButton from '../FloatingActionButton';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

// header Button
const MaterialHeaderButton = (passMeFurther) => (
  <HeaderButton
    {...passMeFurther}
    IconComponent={Material}
    iconSize={32}
    color="#fff"
  />
);

type State = {
  loading: boolean,
};

class ConnectionsScreen extends React.Component<Props, State> {
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
    //     headerRight: (
    //         <Menu>
    //           <MenuTrigger>
    //             <Material
    //                 name="dots-horizontal"
    //                 size={32}
    //                 color="#fff"
    //             />
    //           </MenuTrigger>
    //           <MenuOptions>
    //             <MenuOption onSelect={createNewConnection(navigation)} text='create new connection' />
    //             <MenuOption onSelect={() => {}} text='refresh connections' />
    //             <MenuOption onSelect={() => {}} text='clear all connections' />
    //           </MenuOptions>
    //         </Menu>
    //     ),
  });

  state = {
    loading: true,
  };

  componentDidMount() {
    emitter.on('refreshConnections', this.getConnections);
    emitter.on('removeConnection', this.removeConnection);
  }

  componentWillUnmount() {
    emitter.off('refreshConnections', this.getConnections);
    emitter.off('removeConnection', this.removeConnection);
  }

  getConnections = async () => {
    const { dispatch } = this.props;
    await dispatch(getConnections());
    this.setState({
      loading: false,
    });
  };

  removeConnection = async (id) => {
    try {
      await api.deleteConnection(id);
      // remove connection from async storage
      await AsyncStorage.removeItem(id);
      emitter.emit('refreshConnections', {});
    } catch (err) {
      Alert.alert("Couldn't remove connection", err.message);
    }
  };

  filterConnections = () => {
    const { connections, searchParam } = this.props;
    const searchString = searchParam.toLowerCase().replace(/\s/g, '');
    return connections.filter((item) =>
      `${item.name}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(searchString),
    );
  };

  renderConnection = ({ item }) => <ConnectionCard {...item} />;

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <NavigationEvents
          onDidFocus={() => {
            this.getConnections();
          }}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.mainContainer}>
            <SearchConnections navigation={navigation} sortable={true} />
            <View style={styles.mainContainer}>
              {renderListOrSpinner(this)}
            </View>
          </View>
          <FloatingActionButton
            onPress={() => navigation.navigate('NewConnection')}
          />
        </View>
        <BottomNav style={{ flex: 0 }} navigation={navigation} />
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
    justifyContent: 'center',
    marginTop: 8,
  },
  connectionsContainer: {
    flex: 1,
  },
  moreIcon: {
    marginRight: 16,
  },
  emptyText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
  },
});

export default connect((state) => state.main)(ConnectionsScreen);
