import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { ORANGE } from '@/theme/colors';

export default function ConnectionsCard() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.rowHeader}>
        <Text style={{ fontFamily: 'Poppins-Bold' }}>
          Achievement Completion
        </Text>
        <Material name="arrow-right" size={25} color={ORANGE} />
      </TouchableOpacity>

      <View />

      <Text>2 Task Remaining</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 330,
    height: 222,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: 'rgba(0, 0, 1, 10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rowDetail: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
});
