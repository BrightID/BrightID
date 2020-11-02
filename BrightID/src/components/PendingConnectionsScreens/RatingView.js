// @flow

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RatingButton } from './RatingButton';
import { connection_levels, DEVICE_LARGE } from '../../utils/constants';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '../../utils/connectionLevelStrings';

type RatingViewProps = {
  setLevelHandler: (level: ConnectionLevel) => any,
};

export const RatingView = ({ setLevelHandler }: RatingViewProps) => {
  const { t } = useTranslation();
  return (
    <>
      <View>
        <Text style={styles.ratingHeader}>
          {t('pendingConnections.label.rating')}
        </Text>
      </View>
      <View style={styles.rateButtonContainer}>
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
      </View>
      <View>
        <Text style={styles.ratingFooter}>
          {t('pendingConnections.text.rating')}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  ratingHeader: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 17 : 15,
    marginBottom: 12,
  },
  rateButtonContainer: {
    width: '65%',
  },
  ratingFooter: {
    paddingTop: 18,
    fontFamily: 'Poppins',
    fontWeight: 'normal',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#827F7F',
  },
});
