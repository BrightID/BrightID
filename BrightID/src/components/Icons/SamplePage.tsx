import React from 'react';
import { StyleSheet, View } from 'react-native';

import AddGroup from './AddGroup';
import AddPerson from './AddPerson';
import Avatar from './Avatar';
import BackArrow from './BackArrow';
import Camera from './Camera';
import Certificate from './Certificate';
import ChatBox from './ChatBox';
import Check from './Check';
import Chevron from './Chevron';
import Delete from './Delete';
import Faq from './Faq';
import Filter from './Filter';
import GraphQl from './GraphQl';
import GroupAvatar from './GroupAvatar';
import Home from './Home';
import Info from './Info';
import List from './List';
import Mail from './Mail';
import NotificationBell from './NotificationBell';
import Pencil from './Pencil';
import RecoveryAccount from './RecoveryAccount';
import PhoneLock from './PhoneLock';
import Menu from './Menu';
import Search from './Search';
import VerifiedBadge from './VerifiedBadge';

const SamplePage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.midContainer}>
        <AddGroup />
        <AddPerson />
        <PhoneLock />

        <Certificate />

        <Mail />
        <Faq />
        <GraphQl />
        <Pencil />
        <Home />
        <RecoveryAccount/>
      </View>
      <View style={styles.midContainer}>
        <Menu />
        <List />
        <Filter />
        <VerifiedBadge />
        <Search />
        <Camera />
      </View>
      <View style={styles.midContainer}>
        <Chevron />
        <Check />
        <BackArrow />
        <Delete />
        <ChatBox />
        <NotificationBell alert={true} />
        <Info />
      </View>
      <View style={styles.midContainer}>
        <Avatar width={120} height={120} addPicture={true} />
        <GroupAvatar width={120} height={120} addPicture={true} />
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
