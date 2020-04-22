import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const EmptyApps = () => (
  <View style={styles.container}>
    <MaterialCommunityIcons size={48} name="castle" color="#ccc" />
    <Text style={styles.message}>No Apps</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
  },
  message: {
    fontFamily: 'ApexNew-Medium',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ccc',
  },
});

export default EmptyApps;
