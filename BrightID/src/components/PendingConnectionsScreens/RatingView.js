// @flow

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { connection_levels } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { DARKER_GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '@/utils/connectionLevelStrings';
import { RatingButton } from './RatingButton';

type RatingViewProps = {
  setLevelHandler: (level: ConnectionLevel) => any,
};

export const RatingView = ({ setLevelHandler }: RatingViewProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.ratingHeader}>
        {t('pendingConnections.label.rating')}
      </Text>

      <RatingButton
        color={connectionLevelColors[connection_levels.SUSPICIOUS]}
        label={connectionLevelStrings[connection_levels.SUSPICIOUS]}
        handleClick={() => setLevelHandler(connection_levels.SUSPICIOUS)}
        testID={`${connection_levels.SUSPICIOUS}Btn`}
      />
      <RatingButton
        color={connectionLevelColors[connection_levels.JUST_MET]}
        label={connectionLevelStrings[connection_levels.JUST_MET]}
        handleClick={() => setLevelHandler(connection_levels.JUST_MET)}
        testID={`${connection_levels.JUST_MET}Btn`}
      />
      <RatingButton
        color={connectionLevelColors[connection_levels.ALREADY_KNOWN]}
        label={connectionLevelStrings[connection_levels.ALREADY_KNOWN]}
        handleClick={() => setLevelHandler(connection_levels.ALREADY_KNOWN)}
        testID={`${connection_levels.ALREADY_KNOWN}Btn`}
      />

      <Text style={styles.ratingFooter}>
        {t('pendingConnections.text.rating')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  ratingHeader: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontSize: fontSize[16],
    marginBottom: DEVICE_LARGE ? 5 : 4,
  },

  ratingFooter: {
    paddingTop: DEVICE_LARGE ? 8 : 7,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    fontSize: fontSize[12],
    color: DARKER_GREY,
  },
});
