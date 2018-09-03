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

class SortingConnectionsScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Sorting Connections',
  });

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.sortingOption}>
          <Text style={styles.sortingText}>Sort by name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortingOption}>
          <Text style={styles.sortingText}>Sort by date added</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortingOption}>
          <Text style={styles.sortingText}>Sort by trust score</Text>
        </TouchableOpacity>
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
  sortingOption: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortingText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: '#4990e2',
  },
});

export default connect((state) => state.main)(SortingConnectionsScreen);
