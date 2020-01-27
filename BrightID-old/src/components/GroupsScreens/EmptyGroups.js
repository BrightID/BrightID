// @flow

import * as React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const NoEligibleGroups = ({ navigation }: Props) => (
  <View style={styles.noEligibleContainer}>
    <View style={styles.noEligibleGroupsInfo}>
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
        <Text style={styles.eligibleEmptyGroupsText}>
          By creating and joining groups,
        </Text>
        <Text style={styles.eligibleEmptyGroupsText}>
          you can increase your score
        </Text>
      </View>
    </View>
    <View style={styles.emptyButtons}>
      <TouchableOpacity style={styles.learnMoreButton}>
        <Text style={styles.learnMoreText}>Learn More</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={() => {
          navigation.navigate('NewGroup');
        }}
      >
        <Text style={styles.createGroupText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const NoCurrentGroups = ({ navigation }: Props) => (
  <View style={styles.noCurrentContainer}>
    <View style={styles.noCurrentGroupsInfo}>
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
        <Text style={styles.currentEmptyGroupsText}>
          By creating and joining
        </Text>
        <Text style={styles.currentEmptyGroupsText}>
          groups, you can increase{' '}
        </Text>
        <Text style={styles.currentEmptyGroupsText}>your score</Text>
      </View>
    </View>
    <View style={styles.emptyButtons}>
      <TouchableOpacity style={styles.learnMoreButton}>
        <Text style={styles.learnMoreText}>Learn More</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={() => {
          navigation.navigate('NewGroup');
        }}
      >
        <Text style={styles.createGroupText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const EmptyFullScreen = ({ navigation }: Props) => (
  <View style={styles.fullScreenContainer}>
    <View style={styles.fullScreenEmptyGroupsInfo}>
      <Image
        source={require('../../static/groups.png')}
        style={styles.largeGroupsLogo}
        resizeMode="cover"
        onError={(e) => {
          console.log(e);
        }}
        accessible={true}
        accessibilityLabel="groups logo"
      />
      <View>
        <Text style={styles.fullScreenEmptyGroupsText}>
          By creating and joining groups,
        </Text>
        <Text style={styles.fullScreenEmptyGroupsText}>
          you can increase your score
        </Text>
      </View>
    </View>
    <View style={styles.emptyButtons}>
      <TouchableOpacity style={styles.learnMoreButton}>
        <Text style={styles.learnMoreText}>Learn More</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={() => {
          navigation.navigate('NewGroup');
        }}
      >
        <Text style={styles.createGroupText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  noEligibleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '55%',
    backgroundColor: '#f9f9f9',
  },
  noCurrentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '45%',
    backgroundColor: '#f9f9f9',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  noCurrentGroupsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  noEligibleGroupsInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullScreenEmptyGroupsInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 23,
  },
  emptyButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 17,
  },
  currentEmptyGroupsText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#4a4a4a',
  },
  eligibleEmptyGroupsText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#4a4a4a',
    textAlign: 'center',
  },
  fullScreenEmptyGroupsText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 22,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#4a4a4a',
    textAlign: 'center',
  },
  learnMoreButton: {
    borderRadius: 3,
    borderColor: '#4a90e2',
    borderWidth: 1,
    width: 150,
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnMoreText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: '#4a90e2',
  },
  createGroupButton: {
    marginLeft: 14.5,
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    width: 150,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createGroupText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  smallGroupsLogo: {
    width: 150,
    height: 150,
  },
  largeGroupsLogo: {
    width: 240,
    height: 240,
    marginBottom: 30,
  },
});
