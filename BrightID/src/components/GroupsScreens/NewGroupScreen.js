// @flow

import * as React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-spinkit';
import Ionicon from 'react-native-vector-icons/Ionicons';
import SearchConnections from '../Connections/SearchConnections';
import ConnectionCard from '../Connections/ConnectionCard';
import { getConnections } from '../../actions/getConnections';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

type Props = {
  connections: Array<{
    nameornym: string,
    id: number,
  }>,
  searchParam: string,
};

class NewGroupScreen extends React.Component<Props> {
  static navigationOptions = {
    title: 'New Group',
    headerRight: <View />,
  };

  componentDidMount() {
    this.getConnections();
  }

  getConnections = () => {
    const { dispatch } = this.props;
    dispatch(getConnections());
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
      <View>
        <Ionicon size={37} name="ios-checkmark-circle-outline" color="#333" />
      </View>
    </TouchableOpacity>
  );

  renderConnection = ({ item }) => (
    <ConnectionCard {...item} groups={true} style={styles.connectionCard} />
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
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>CO-FOUNDERS</Text>
          <Text style={styles.infoText}>
            To create a group, you must select two co-founders
          </Text>
        </View>
        <SearchConnections navigation={this.props.navigation} />
        <View style={styles.mainContainer}>{this.renderList()}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  connectionsContainer: {
    flex: 1,
    width: '96.7%',
    borderTopWidth: 1,
    borderTopColor: '#e3e1e1',
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
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: '#fff',
    width: '96.7%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e1e1',
    paddingTop: 11,
    paddingBottom: 11,
  },
  titleText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.09)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  infoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  connectionCard: {
    marginBottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e1e1',
    width: '100%',
  },
});

export default connect((state) => state.main)(NewGroupScreen);
