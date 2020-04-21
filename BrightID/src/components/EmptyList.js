import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';

const EmptyList = ({ title }) => (
    <View style={styles.emptyContainer}>
        <Octicons size={26} name="info" color="#333" />
        <Text style={styles.emptyText}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 15,
        marginLeft: 10
    },
});

export default EmptyList