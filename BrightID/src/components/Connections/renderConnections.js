import * as React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Spinner from 'react-native-spinkit';

export const renderListOrSpinner = (comp) => {
  const { connections } = comp.props;
  if (comp.state && comp.state.loading) {
    return (
      <Spinner
        style={styles.spinner}
        isVisible={true}
        size={47}
        type="WanderingCubes"
        color="#4990e2"
      />
    );
  } else if (connections.length > 0) {
    return (
      <FlatList
        style={styles.connectionsContainer}
        data={comp.filterConnections()}
        keyExtractor={({ publicKey }, index) => publicKey + index}
        renderItem={comp.renderConnection}
      />
    );
  } else {
    return (
      <View>
        <Text style={styles.emptyText}>No connections</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  connectionsContainer: {
    flex: 1,
  },
  emptyText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
  },
});
