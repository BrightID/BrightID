// @flow

import React from 'react';
import { StyleSheet, View } from 'react-native';

import AddGroup from './AddGroup';
import AddPerson from './AddPerson';
import BackArrow from './BackArrow';
import Camera from './Camera';
import Caret from './Caret';
import Certificate from './Certificate';
import Check from './Check';
import Mail from './Mail';

const SamplePage = () => {
  return (
    <View style={styles.container}>
      <AddGroup />
      <AddPerson />
      <BackArrow />
      <Camera />
      <Caret />
      <Certificate />
      <Check />
      <Mail />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    // flexWrap: 'wrap',
  },
});

export default SamplePage;
