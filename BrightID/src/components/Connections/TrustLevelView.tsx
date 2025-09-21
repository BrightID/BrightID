import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
  getConnectionLevelColor,
  getConnectionLevelString,
} from '@/utils/connectionLevelStrings';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { BLACK, BLUE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { connection_levels } from '@/utils/constants';

type Props = {
  level: ConnectionLevel;
  connectionId: string;
};

function TrustLevelView({ level, connectionId }: Props) {
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
        <Text style={styles.trustLevelLabelText}>
          {t('connectionDetails.label.connectionLevel')}
        </Text>
      </View>

      <View style={styles.trustLevel}>
        <Text
          testID="ConnectionLevelText"
          style={[
            styles.trustLevelText,
            { color: getConnectionLevelColor(level) },
          ]}
        >
          {getConnectionLevelString(level)}
        </Text>
      </View>
      {level !== connection_levels.REPORTED && (
        <TouchableOpacity
          style={styles.trustLevelButton}
          testID="EditConnectionLevelBtn"
          onPress={setLevel}
        >
          <MaterialDesignIcons
            name="pencil"
            size={DEVICE_LARGE ? 22 : 20}
            color={BLUE}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DEVICE_LARGE ? 22 : 20,
  },
  trustLevelLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustLevelLabelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: BLACK,
  },
  trustLevel: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  trustLevelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: BLACK,
  },
  trustLevelButton: {
    padding: 5,
  },
});

export default TrustLevelView;
