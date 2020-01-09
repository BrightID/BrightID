// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import SearchConnections from '../Connections/SearchConnections';
import TrustedConnectionCard from './TrustedConnectionCard';
import { renderListOrSpinner } from '../Connections/renderConnections';
import { setTrusted } from './helpers';

/**
 * Backup screen of BrightID
 * Displays a search input and list of Connection Cards
 */

type State = {
  loading: boolean,
};

class TrustedConnectionsScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Trusted Connections',
  });

  filterConnections = () => {
    const { connections, searchParam } = this.props;
    return connections.filter((item) =>
      `${item.name}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(searchParam.toLowerCase().replace(/\s/g, '')),
    );
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
      setTrusted()
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
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.infoText}>
              Choose three or more trusted connections to back up your BrightID.
            </Text>
            <Text style={styles.infoText}>
              If your BrightID is lost or stolen, you can reconnect with two
              trusted connections to recover it.
            </Text>
          </View>
          <SearchConnections navigation={navigation} />
          <View style={styles.mainContainer}>{renderListOrSpinner(this)}</View>
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
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
    marginBottom: 30,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default connect((state) => state)(TrustedConnectionsScreen);
