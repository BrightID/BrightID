// @flow

import * as React from 'react';
import { TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';
import { createNewConnection } from './createNewConnection';
import emitter from '../../emitter';
import BottomNav from '../BottomNav';
import { renderListOrSpinner } from './renderConnections';
import api from '../../Api/BrightId';
import FloatingActionButton from '../FloatingActionButton';
import { removeConnection } from '../../actions';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

type State = {
  loading: boolean,
};

export class ConnectionsScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }: { navigation: navigation }) => ({
    title: 'Connections',
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 11 }}
        onPress={createNewConnection(navigation)}
      >
        <Material name="dots-horizontal" size={32} color="#fff" />
      </TouchableOpacity>
    ),
  });

  componentDidMount() {
    const { navigation } = this.props;
    emitter.on('removeConnection', this.removeConnection);
    navigation.addListener('willBlur', () => {
      emitter.off('removeConnection', this.removeConnection);
    });
  }

  removeConnection = async (id: string) => {
    try {
      const { dispatch } = this.props;
      const res = await api.deleteConnection(id);
      // TODO - only delete connection if verified on the backend
      console.log(res);
      // remove connection from redux
      dispatch(removeConnection(id));
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

export default connect((state) => state)(ConnectionsScreen);
