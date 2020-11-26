// @flow

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Material from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '@/utils/connectionLevelStrings';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

type props = {
  level: ConnectionLevel,
  connectionId: string,
};

function TrustLevelView({ level, connectionId }: props) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const setLevel = () => {
    navigation.navigate('SetTrustlevel', {
      connectionId,
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.trustLevelLabel}>
        <Text style={styles.trustLevelLabelText}>{t('connectionDetails.label.connectionLevel')}</Text>
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
        <Material name="edit" size={DEVICE_LARGE ? 23 : 20} color="#2185D0" />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustLevelLabelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#000',
  },
  trustLevel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustLevelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 14 : 12,
  },
  trustLevelButton: {
    paddingLeft: 5,
    paddingBottom: 5,
    paddingTop: 5,
    paddingRight: 5,
  },
});

export default TrustLevelView;
