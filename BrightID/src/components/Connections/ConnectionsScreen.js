// @flow

import * as React from 'react';
import { AsyncStorage, StyleSheet, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import HeaderButtons, {
  HeaderButton,
  Item,
} from 'react-navigation-header-buttons';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';
import { NavigationEvents } from 'react-navigation';
import { getConnections } from '../../actions/getConnections';
import { createNewConnection } from './createNewConnection';
import emitter from '../../emitter';
import BottomNav from '../BottomNav';
import { renderListOrSpinner } from './renderConnections';
import api from '../../Api/brightId';

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

type Props = {
  connections: Array<{
    nameornym: string,
    id: number,
  }>,
  searchParam: string,
  dispatch: (() => Promise<null>) => Promise<null>,
};

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
  });

  state = {
    loading: true,
  };

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
    const { dispatch } = this.props;
    await dispatch(getConnections());
    this.setState({
      loading: false,
    });
  };

  removeConnection = async (publicKey) => {
    try {
      await api.deleteConnection(publicKey);
      // remove connection from async storage
      await AsyncStorage.removeItem(JSON.stringify(publicKey));
      emitter.emit('refreshConnections', {});
    } catch (err) {
      Alert("Couldn't remove connection", err.stack);
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
        <View style={styles.mainContainer}>
          <SearchConnections navigation={navigation} />
          <View style={styles.mainContainer}>{renderListOrSpinner(this)}</View>
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
