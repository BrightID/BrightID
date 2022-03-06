import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import Contacts from 'react-native-contacts';
import { useFocusEffect } from '@react-navigation/native';
import { DEVICE_IOS, DEVICE_LARGE } from '@/utils/deviceConstants';
import { DARKER_GREY, GREY, ORANGE, WHITE } from '@/theme/colors';
import { useDispatch, useSelector } from '@/store';
import {
  selectCompletedTaskIds,
  selectTaskIds,
} from '@/components/Tasks/TasksSlice';
import { SocialMediaFriendRaw } from '@/api/socialMediaService_types';
import socialMediaService from '@/api/socialMediaService';
import { BrightIdNetwork } from '@/components/Apps/model';
import { selectAllSocialMediaVariations } from '@/reducer/socialMediaVariationSlice';
import { fontSize } from '@/theme/fonts';

const FlatListItemSeparator = () => {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: GREY,
      }}
    />
  );
};

type FriendProfile = {
  profile: string;
  name: string;
};

type SocialMediaFriend = {
  profile: FriendProfile;
  variation: SocialMediaVariation;
};

const parsePhoneNumber = (phoneNumber: string) =>
  parseInt(phoneNumber.match(/\d/g).join(''), 10).toString();

export const FindFriendsScreen = function () {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const taskIds = useSelector(selectTaskIds);
  const completedTaskIds = useSelector(selectCompletedTaskIds);
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
  const isDrawerOpen = useIsDrawerOpen();

  const [friendProfiles, setFriendProfiles] = useState<FriendProfile[]>(null);

  const [friendsRaw, setFriendsRaw] = useState<SocialMediaFriendRaw[]>(null);

  const fetchFriends = useCallback(async () => {
    const _friendProfiles: FriendProfile[] = [];
    const permissionStatus = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
        buttonPositive: 'Please accept bare mortal',
        buttonNegative: 'No, thanks',
      },
    );
    if (permissionStatus === 'granted') {
      const contacts = await Contacts.getAll();
      contacts.forEach((contact) => {
        const contactName = contact.displayName;
        contact.emailAddresses.forEach((emailAddress) =>
          _friendProfiles.push({
            name: contactName,
            profile: emailAddress.email,
          }),
        );
        contact.phoneNumbers.forEach((phoneNumber) =>
          _friendProfiles.push({
            name: contactName,
            profile: parsePhoneNumber(phoneNumber.number),
          }),
        );
      });
    }
    setFriendProfiles(_friendProfiles);
    const _friendsRaw = await socialMediaService.querySocialMedia({
      profiles: _friendProfiles.map((friendProfile) => friendProfile.profile),
      network: __DEV__ ? BrightIdNetwork.TEST : BrightIdNetwork.NODE,
    });
    setFriendsRaw(_friendsRaw);
  }, []);

  useEffect(() => {
    fetchFriends().catch(console.error);
  }, [fetchFriends]);

  const socialMediaVariations = useSelector(selectAllSocialMediaVariations);
  const [friends, setFriends] = useState<SocialMediaFriend[]>(null);

  useEffect(() => {
    if (friendsRaw) {
      setFriends(
        friendsRaw.map((friendRaw) => {
          const name = friendProfiles?.find((friendProfile) =>
            friendRaw.profile.endsWith(friendProfile.profile),
          )?.name;
          return {
            profile: {
              name,
              profile: friendRaw.profile,
            },
            variation: socialMediaVariations.find(
              (variation) => variation.id === friendRaw.variation,
            ),
          };
        }),
      );
    }
  }, [socialMediaVariations, friendsRaw, friendProfiles]);

  const keyExtractor = (item, idx) => {
    return item?.recordID?.toString() || idx.toString();
  };
  const renderItem = ({ item }: { item: SocialMediaFriend }) => {
    return (
      <View style={styles.contactCon}>
        <View style={styles.imgCon}>
          <View style={styles.placeholder}>
            <Text style={styles.txt}>
              {item.profile.name ? item.profile.name[0] : ''}
            </Text>
          </View>
        </View>
        <View style={styles.contactDat}>
          <Text style={styles.name}>{item.profile.name}</Text>
          <Text style={styles.phoneNumber}>{item.profile.profile}</Text>
        </View>
        <View style={styles.contactAction}>
          <TouchableOpacity
            testID="InviteBtn"
            style={styles.inviteBtn}
            onPress={() => {
              console.log('Press');
            }}
          >
            <Text style={styles.inviteBtnText}>{t('invite')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { marginTop: headerHeight },
        !isDrawerOpen && styles.shadow,
      ]}
      testID="tasksScreen"
    >
      {friendsRaw ? (
        <FlatList
          data={friends}
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={FlatListItemSeparator}
          renderItem={renderItem}
        />
      ) : (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color={DARKER_GREY}
          animating
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inviteBtn: {
    width: '100%',
    height: 40,
    borderRadius: 100,
    borderColor: ORANGE,
    borderWidth: 1,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: ORANGE,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
    paddingLeft: 10,
    paddingRight: 18,
  },
  shadow: {
    shadowColor: 'rgba(196, 196, 196, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  contactCon: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d9d9d9',
    paddingVertical: 24,
    paddingHorizontal: 18,
  },
  imgCon: {},
  placeholder: {
    width: 55,
    height: 55,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#d9d9d9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDat: {
    flex: 3,
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 5,
  },
  contactAction: {
    flex: 1.4,
    justifyContent: 'center',
    paddingLeft: 5,
  },
  txt: {
    fontSize: 18,
  },
  name: {
    fontSize: 16,
  },
  phoneNumber: {
    color: '#888',
  },
});

export default FindFriendsScreen;
