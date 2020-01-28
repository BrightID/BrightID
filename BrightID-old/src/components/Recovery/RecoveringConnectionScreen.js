// @flow

import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import SearchConnections from '../Connections/SearchConnections';
import RecoveringConnectionCard from './RecoveringConnectionCard';
import { renderListOrSpinner } from '../Connections/renderConnections';

type State = {
  loading: boolean,
};

class RecoveringConnectionScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Account Recovery',
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

  renderConnection = ({ item }) => (
    <RecoveringConnectionCard
      {...item}
      recoveryRequestCode={
        this.props.navigation.state.params.recoveryRequestCode
      }
      navigation={this.props.navigation}
      style={styles.recoveringConnectionCard}
    />
  );

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Choose Connection</Text>
            <Text style={styles.infoText}>
              Please select the connection whose account you are helping to
              recover.
            </Text>
          </View>
          <SearchConnections navigation={navigation} />
          <View style={styles.mainContainer}>{renderListOrSpinner(this)}</View>
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
  moreIcon: {
    marginRight: 16,
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
    textAlign: 'center',
  },
  recoveringConnectionCard: {
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
  saveButton: {
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

export default connect((state) => state)(RecoveringConnectionScreen);
