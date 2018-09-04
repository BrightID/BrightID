// @flow

import * as React from 'react';
import {
  Alert,
  AsyncStorage,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import {
  sortByNameAscending,
  sortByNameDescending,
  sortByDateAddedAscending,
  sortByDateAddedDescending,
  sortByTrustScoreAscending,
  sortByTrustScoreDescending,
  types,
} from './sortingUtility';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

type Props = {
  connections: Array<{
    nameornym: string,
    id: number,
  }>,
  dispatch: () => null,
  connectionsSort: string,
  searchParam: string,
};

class SortingConnectionsScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Connections',
    headerRight: (
      <TouchableOpacity
        style={styles.headerSave}
        onPress={() => {
          navigation.goBack(null);
        }}
      >
        <Text style={styles.headerSaveText}>Save</Text>
      </TouchableOpacity>
    ),
  });

  render() {
    const { dispatch, connectionsSort } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Sorting connections</Text>
          <Text style={styles.infoText}>Choose one of the methods below</Text>
        </View>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={{ ...styles.sortingOption }}
            onPress={() => {
              dispatch(sortByNameAscending());
            }}
          >
            <Text style={styles.sortingText}>Sort by name ascending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...styles.sortingOption }}
            onPress={() => {
              dispatch(sortByNameDescending());
            }}
          >
            <Text style={styles.sortingText}>Sort by name descending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...styles.sortingOption }}
            onPress={() => {
              dispatch(sortByDateAddedAscending());
            }}
          >
            <Text style={styles.sortingText}>Sort by date added ascending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...styles.sortingOption }}
            onPress={() => {
              dispatch(sortByDateAddedDescending());
            }}
          >
            <Text style={styles.sortingText}>
              Sort by date added descending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...styles.sortingOption }}
            onPress={() => {
              dispatch(sortByTrustScoreAscending());
            }}
          >
            <Text style={styles.sortingText}>
              Sort by trust score ascending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...styles.sortingOption }}
            onPress={() => {
              dispatch(sortByTrustScoreDescending());
            }}
          >
            <Text style={styles.sortingText}>
              Sort by trust score descending
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  optionsContainer: {
    width: '96.7%',
  },
  sortingOption: {
    padding: 33,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    borderRadius: 5,
  },
  sortingText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: '#4990e2',
  },
  titleContainer: {
    justifyContent: 'space-around',
    height: 106,
    paddingTop: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e1e1',
    width: '96.7%',
  },
  titleText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.09)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  infoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
  },
  headerSave: {},
  headerSaveText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 18,
    color: '#fff',
    marginRight: 11,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.24)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  selected: {
    borderWidth: 1,
    borderColor: '#4990e2',
  },
});

export default connect((state) => state.main)(SortingConnectionsScreen);
