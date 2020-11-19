// @flow

import * as React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

const learnMoreUrl =
  'https://docs.google.com/document/d/1CEBWv4ImXsZYQ2Qll7BXojeKI9CGtzRXjB9aFIj00c4/edit#heading=h.nr1odgliy5nk';

const handleLearnMore = () => {
  Linking.openURL(learnMoreUrl).catch((err) =>
    console.log(`Failed to open "${learnMoreUrl}", error was: ${err}`),
  );
};

export const NoGroups = ({ navigation }: Props) => (
  <View style={styles.noContainer} testID="noGroupsView">
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
        <Text style={styles.emptyGroupsText}>Get verified faster</Text>
        <Text style={styles.emptyGroupsText}>by creating and</Text>
        <Text style={styles.emptyGroupsText}>joining groups</Text>
      </View>
    </View>
    <View style={styles.emptyButtons}>
      <TouchableOpacity
        testID="groupsLearnMoreBtn"
        style={styles.learnMoreButton}
        onPress={handleLearnMore}
      >
        <Text style={styles.learnMoreText}>Learn More</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="groupsCreateGroupBtn"
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
    fontSize: DEVICE_LARGE ? 18 : 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#4a4a4a',
  },
  learnMoreButton: {
    borderRadius: 3,
    borderColor: '#4a90e2',
    borderWidth: 1,
    width: DEVICE_LARGE ? 150 : 125,
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnMoreText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: DEVICE_LARGE ? 18 : 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#4a90e2',
  },
  createGroupButton: {
    marginLeft: 14.5,
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    width: DEVICE_LARGE ? 150 : 125,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createGroupText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: DEVICE_LARGE ? 18 : 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  smallGroupsLogo: {
    width: DEVICE_LARGE ? 150 : 135,
    height: DEVICE_LARGE ? 150 : 135,
  },
});
