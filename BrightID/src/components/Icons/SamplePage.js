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
import Faq from './Faq';
import GraphQl from './GraphQl';
import Pencil from './Pencil';
import Home from './Home';
import Menu from './Menu';
import List from './List';
import VerifiedSticker from './VerifiedSticker';
import Search from './Search';

const SamplePage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.midContainer}>
        <AddGroup />
        <AddPerson />
        <BackArrow />
        <Camera />
        <Caret />
        <Certificate />
        <Check />
        <Mail />
        <Faq />
      </View>
      <View style={styles.midContainer}>
        <GraphQl />
        <Pencil />
        <Home />
        <Menu />
        <List />
        <VerifiedSticker />
      </View>
      <View style={styles.midContainer}>
        <Search />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 30,
  },
  midContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    width: '100%',
    marginVertical: 10,
  },
});

export default SamplePage;
