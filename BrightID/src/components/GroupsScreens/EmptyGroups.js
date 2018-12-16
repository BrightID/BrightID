import * as React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const NoCurrentGroups = () => (
  <View style={styles.container}>
    <View style={styles.noCurrentGroupsInfo}>
      <Image
        source={require('../../static/groups_logo.png')}
        style={styles.groupsLogo}
        resizeMode="cover"
        onError={(e) => {
          console.log(e.error);
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
      <TouchableOpacity style={styles.learnMoreButton}>
        <Text style={styles.learnMoreText}>Learn More</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.createGroupButton}>
        <Text style={styles.createGroupText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  noCurrentGroupsInfo: {
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
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#4a4a4a',
  },
  learnMoreButton: {
    borderRadius: 3,
    borderColor: '#4a90e2',
    borderWidth: 1,
    width: 150,
    paddingTop: 12,
    paddingBottom: 11,
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
    paddingTop: 13,
    paddingBottom: 12,
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
});
