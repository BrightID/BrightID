// @flow

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RatingButton } from './RatingButton';
import { connection_levels, DEVICE_LARGE } from '../../utils/constants';

type RatingViewProps = {
  setLevelHandler: (level) => any,
};

export const RatingView = ({ setLevelHandler }: RatingViewProps) => {
  return (
    <>
      <View>
        <Text style={styles.ratingHeader}>
          How well do you know this connection?
        </Text>
      </View>
      <View style={styles.rateButtonContainer}>
        <RatingButton
          color="red"
          label="🤔 Suspicious"
          level={connection_levels.SUSPICIOUS}
          handleClick={() => setLevelHandler(connection_levels.SUSPICIOUS)}
          testID={`${connection_levels.SUSPICIOUS}Btn`}
        />
        <RatingButton
          color="yellow"
          label="👋 Just met"
          level={connection_levels.JUST_MET}
          handleClick={() => setLevelHandler(connection_levels.JUST_MET)}
          testID={`${connection_levels.JUST_MET}Btn`}
        />
        <RatingButton
          color="green"
          label="😎 Already know"
          level={connection_levels.ALREADY_KNOWN}
          handleClick={() => setLevelHandler(connection_levels.ALREADY_KNOWN)}
          testID={`${connection_levels.ALREADY_KNOWN}Btn`}
        />
      </View>
      <View>
        <Text style={styles.ratingFooter}>
          Your answer will help us prevent attacks
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
