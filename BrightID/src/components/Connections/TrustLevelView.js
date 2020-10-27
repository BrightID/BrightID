// @flow

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Material from 'react-native-vector-icons/MaterialIcons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { connection_levels, DEVICE_LARGE } from '../../utils/constants';

type props = {
  level: ConnectionLevel,
  handleChange: (level: ConnectionLevel) => {},
};

function TrustLevelView({ level, handleChange }: props) {
  const { showActionSheetWithOptions } = useActionSheet();

  const [levelProps, setLevelProps] = useState<{
    color: string,
    label: string,
    testID: string,
  }>({
    color: '#F6BF08',
    label: '',
    testID: '',
  });

  useEffect(() => {
    let color, label;
    let testID = `${level}Btn`;
    switch (level) {
      case connection_levels.REPORTED:
        color = 'red';
        label = '✋ Flagged';
        break;
      case connection_levels.SUSPICIOUS:
        color = 'red';
        label = '🤔 Suspicious';
        break;
      case connection_levels.ALREADY_KNOWN:
        color = 'green';
        label = '😎 Already known';
        break;
      case connection_levels.RECOVERY:
        color = 'green';
        label = '🔐 Recovery';
        break;
      case connection_levels.JUST_MET:
      default:
        color = '#F6BF08';
        label = '👋 Just met';
    }
    setLevelProps({ color, label, testID });
  }, [level]);

  const setLevel = () => {
    showActionSheetWithOptions(
      {
        options: [
          '🤔 Suspicious',
          '👋 Just met',
          '😎 Already known',
          '🔐 Recovery',
          'Cancel',
        ],
        cancelButtonIndex: 4,
        title: 'Set Connection Level',
        message: `How well do you know this connection?`,
        showSeparators: true,
        textStyle: {
          color: '#2185D0',
          textAlign: 'center',
          width: '100%',
        },
        titleTextStyle: {
          fontSize: DEVICE_LARGE ? 20 : 17,
        },
        messageTextStyle: {
          fontSize: DEVICE_LARGE ? 15 : 12,
        },
      },
      (index) => {
        switch (index) {
          case 0:
            handleChange(connection_levels.SUSPICIOUS);
            break;
          case 1:
            handleChange(connection_levels.JUST_MET);
            break;
          case 2:
            handleChange(connection_levels.ALREADY_KNOWN);
            break;
          case 3:
            handleChange(connection_levels.RECOVERY);
            break;
          case 4:
            // cancelled, do nothing
            break;
          default:
            console.log(`unhandled index ${index}`);
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.trustLevelLabel}>
        <Text style={styles.trustLevelLabelText}>Connection Level</Text>
      </View>
      <View style={styles.trustLevel}>
        <Text style={[styles.trustLevelText, { color: levelProps.color }]}>
          {levelProps.label}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.trustLevelButton}
        testID={levelProps.testID}
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
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    color: '#000',
  },
  trustLevel: {
    width: '40%',
  },
  trustLevelText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
  },
  trustLevelButton: {
    paddingLeft: 5,
    paddingBottom: 5,
    paddingTop: 5,
  },
});

export default TrustLevelView;
