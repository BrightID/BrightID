import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EmptyList = ({ title, iconType='information-outline' iconSize = 26, messageStyle, iconColor="#ccc"  }) => (
    <View style={styles.emptyContainer}>
        <MaterialCommunityIcons size={iconSize} name={iconType} color={iconColor} />
        <Text style={messageStyle ? messageStyle : styles.emptyText}>{title}</Text>
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
        fontFamily: 'ApexNew-Medium',
        marginLeft: 10
    },
});

export default EmptyList
