// @flow

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connection_levels } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '@/utils/connectionLevelStrings';
import { RatingButton } from './RatingButton';

type RatingViewProps = {
  setLevelHandler: (level: ConnectionLevel) => any,
};

export const RatingView = ({ setLevelHandler }: RatingViewProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.ratingHeader}>
        How well do you know this connection?
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
        Your answer will help us prevent attacks
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
    fontSize: DEVICE_LARGE ? 16 : 13,
    marginBottom: DEVICE_LARGE ? 5 : 4,
  },

  ratingFooter: {
    paddingTop: DEVICE_LARGE ? 8 : 7,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 12 : 11,
    color: '#827F7F',
  },
});
