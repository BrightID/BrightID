// @flow

import * as React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import emitter from '@/emitter';
import { DEVICE_TYPE } from '@/utils/constants';

const showWhitePaper = () => {
  emitter.emit('showWhitePaper');
};

export const NoGroups = ({ navigation }: Props) => (
  <View style={styles.noContainer}>
    <View style={styles.noGroupsInfo}>
      <Image
        source={require('../../static/groups_logo.png')}
        style={styles.smallGroupsLogo}
        resizeMode="cover"
        onError={(e) => {
          console.log(e);
        }}
        accessible={true}
        accessibilityLabel="groups logo"
      />
      <View>
        <Text style={styles.emptyGroupsText}>By creating and joining</Text>
        <Text style={styles.emptyGroupsText}>groups, you can increase </Text>
        <Text style={styles.emptyGroupsText}>your score</Text>
      </View>
    </View>
    <View style={styles.emptyButtons}>
      <TouchableOpacity style={styles.learnMoreButton} onPress={showWhitePaper}>
        <Text style={styles.learnMoreText}>Learn More</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={() => {
          navigation.navigate('GroupInfo');
        }}
      >
        <Text style={styles.createGroupText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  noContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // height: 280,
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  noGroupsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 17,
  },
  emptyGroupsText: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'large' ? 18 : 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#4a4a4a',
  },
  learnMoreButton: {
    borderRadius: 3,
    borderColor: '#4a90e2',
    borderWidth: 1,
    width: DEVICE_TYPE === 'large' ? 150 : 125,
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnMoreText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: DEVICE_TYPE === 'large' ? 18 : 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#4a90e2',
  },
  createGroupButton: {
    marginLeft: 14.5,
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    width: DEVICE_TYPE === 'large' ? 150 : 125,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createGroupText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: DEVICE_TYPE === 'large' ? 18 : 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  smallGroupsLogo: {
    width: DEVICE_TYPE === 'large' ? 150 : 135,
    height: DEVICE_TYPE === 'large' ? 150 : 135,
  },
});
