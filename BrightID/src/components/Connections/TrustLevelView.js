// @flow

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Material from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '@/utils/connectionLevelStrings';

type props = {
  level: ConnectionLevel,
  connectionId: string,
};

function TrustLevelView({ level, connectionId }: props) {
  const navigation = useNavigation();
  const setLevel = () => {
    navigation.navigate('SetTrustlevel', {
      connectionId,
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.trustLevelLabel}>
        <Text style={styles.trustLevelLabelText}>Connection Level</Text>
      </View>
      <View style={styles.trustLevel}>
        <Text
          testID="ConnectionLevelText"
          style={[
            styles.trustLevelText,
            { color: connectionLevelColors[level] },
          ]}
        >
          {connectionLevelStrings[level]}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.trustLevelButton}
        testID="EditConnectionLevelBtn"
        onPress={setLevel}
      >
        <Material name="edit" size={23} color="#2185D0" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustLevelLabel: {
    width: '50%',
  },
  trustLevelLabelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 17,
    color: '#000',
  },
  trustLevel: {
    width: '40%',
  },
  trustLevelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 17,
  },
  trustLevelButton: {
    paddingLeft: 5,
    paddingBottom: 5,
    paddingTop: 5,
  },
});

export default TrustLevelView;
