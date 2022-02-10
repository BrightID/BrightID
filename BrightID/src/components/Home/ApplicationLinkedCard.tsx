import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { ORANGE } from '@/theme/colors';

export default function ApplicationLinkedCard() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.rowHeader}>
        <Text style={{ fontFamily: 'Poppins-Bold' }}>Application Linked</Text>
        <Material name="arrow-right" size={25} color={ORANGE} />
      </TouchableOpacity>

      <View style={styles.rowDetail}>
        <Material name="card" size={35} />
        <Text style={styles.appLabel}>GitCoin</Text>
        <View />
      </View>

      <View>
        <View style={{ backgroundColor: 'blue', width: 35, height: 35 }} />
        <View
          style={{
            backgroundColor: 'red',
            width: 35,
            height: 35,
            position: 'absolute',
            left: 20,
          }}
        />
      </View>
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
    elevation: 3,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rowDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appLabel: {
    fontFamily: 'Poppins-Medium',
    marginLeft: 10,
  },
});
