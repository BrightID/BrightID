import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EmptyList = ({ title, iconType = 'information-outline' }) => (
  <View style={styles.container}>
    <MaterialCommunityIcons size={26} name={iconType} color="#ccc" />
    <Text style={styles.message}>{title}</Text>
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

export default EmptyList;
