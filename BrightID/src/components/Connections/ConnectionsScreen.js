// @flow

import * as React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';
import { createNewConnection } from './createNewConnection';
import BottomNav from '../BottomNav';
import { renderListOrSpinner } from './renderConnections';
import FloatingActionButton from '../FloatingActionButton';
import { defaultSort } from './sortingUtility';

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
    const { navigation, dispatch } = this.props;
    navigation.addListener('willFocus', () => {
      dispatch(defaultSort());
    });
  }

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
