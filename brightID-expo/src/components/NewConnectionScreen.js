// @flow

import * as React from 'react';
import { Text, FlatList, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';

/**
 * Connection screen of BrightID
 */

type Props = {
  allConnections: Array<{
    firstName: string,
    lastName: string,
    id: number,
  }>,
  searchParam: string,
};

class NewConnectionScreen extends React.Component<Props> {
  static navigationOptions = {
    title: 'New Connection',
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>Hi</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  connectionsContainer: {
    marginTop: 8,
    flex: 1,
  },
});

export default connect((state) => state.main)(NewConnectionScreen);
