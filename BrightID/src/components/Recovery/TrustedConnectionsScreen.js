// @flow

import * as React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
} from 'react-native';
import { connect } from 'react-redux';
import { DEVICE_TYPE } from '@/utils/constants';
import SearchConnections from '../Connections/SearchConnections';
import TrustedConnectionCard from './TrustedConnectionCard';
import { setTrustedConnections } from './helpers';
import EmptyList from '../EmptyList';

/**
 * Backup screen of BrightID
 * Displays a search input and list of Connection Cards
 */

class TrustedConnectionsScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Trusted Connections',
    headerBackTitleVisible: false,
  });

  filterConnections = () => {
    const { connections, searchParam } = this.props;
    return connections
      .filter((item) =>
        `${item.name}`
          .toLowerCase()
          .replace(/\s/g, '')
          .includes(searchParam.toLowerCase().replace(/\s/g, '')),
      )
      .filter((item) => item.status === 'verified');
  };

  cardIsSelected = (card) => {
    const { trustedConnections } = this.props;
    return trustedConnections.includes(card.id);
  };

  renderConnection = ({ item }) => (
    <TrustedConnectionCard
      {...item}
      selected={this.cardIsSelected(item)}
      style={styles.connectionCard}
    />
  );

  navigateToBackup = async () => {
    let { navigation, trustedConnections } = this.props;
    if (trustedConnections.length < 3) {
      Alert.alert(
        'Error',
        'You need at least three trusted connections for backup.',
      );
    } else {
      setTrustedConnections()
        .then((success) => {
          if (success) navigation.navigate('Backup');
        })
        .catch((err) => {
          if (err.message === `trusted connections can't be overwritten`) {
            navigation.navigate('Backup');
          }
          console.warn(err.message);
        });
    }
  };

  render() {
    const { navigation } = this.props;
    const connections = this.filterConnections();

    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.infoText}>
              Choose three or more trusted connections to back up your BrightID.
            </Text>
            {DEVICE_TYPE === 'large' && (
              <Text style={styles.infoText}>
                If your BrightID is lost or stolen, you can reconnect with two
                trusted connections to recover it.
              </Text>
            )}
          </View>
          {DEVICE_TYPE === 'large' && (
            <SearchConnections navigation={navigation} />
          )}
          <View style={styles.mainContainer}>
            <FlatList
              style={styles.connectionsContainer}
              data={connections}
              keyExtractor={({ id }, index) => id + index}
              renderItem={this.renderConnection}
              ListEmptyComponent={
                <EmptyList title="No connections..." />
              }
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={this.navigateToBackup}
            style={styles.nextButton}
          >
            <Text style={styles.buttonInnerText}>Next</Text>
          </TouchableOpacity>
        </View>
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
    marginTop: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionsContainer: {
    flex: 1,
    width: '96.7%',
    borderTopWidth: 1,
    borderTopColor: '#e3e1e1',
  },
  emptyText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_TYPE === 'large' ? 6 : 0,
    backgroundColor: '#fff',
    width: '96.7%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e1e1',
    marginBottom: 11,
  },
  infoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    margin: 6,
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
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#428BE5',
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 12,
    marginTop: 9,
    marginBottom: DEVICE_TYPE === 'large' ? 30 : 9,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default connect(({ connections, user }) => ({
  ...connections,
  ...user,
}))(TrustedConnectionsScreen);
