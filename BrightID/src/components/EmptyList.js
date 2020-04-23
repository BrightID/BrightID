import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EmptyList = ({ title, iconType='information-outline', iconSize = 26, iconColor="#ccc"  }) => (
    <View style={styles.emptyContainer}>
        <MaterialCommunityIcons size={iconSize} name={iconType} color={iconColor} />
        <Text style={styles.emptyText}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 18,
      color: '#ccc',
      marginLeft: 10
    },
});

export default EmptyList
