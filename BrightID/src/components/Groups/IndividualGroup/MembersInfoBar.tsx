import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { GREY, GREEN, RED } from '@/theme/colors';
import SearchMembers from '../../Helpers/SearchMembers';
import AddPerson from '../../Icons/AddPerson';
import Delete from '../../Icons/Delete';

type Props = { group: Group };

function MembersSearch({ group }: Props) {
  const membersSearchOpen = useSelector(
    (state) => state.groups.membersSearchOpen,
  );

  const { t } = useTranslation();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: membersSearchOpen ? 0 : 1,
      useNativeDriver: true,
      duration: 600,
    }).start();
  }, [fadeAnim, membersSearchOpen]);

  return (
    <>
      <View style={styles.container}>
        <Animated.View
          style={[{ opacity: fadeAnim }, styles.memberInfoContainer]}
        >
          <Text style={styles.memberCount}>
            {t('groups.text.membersCount', {
              count: group.members?.length,
            })}
          </Text>
          <View style={styles.btnsContainer}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                console.log('pressed');
              }}
            >
              <AddPerson color={GREEN} width={22} height={22} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                console.log('pressed');
              }}
            >
              <Delete color={RED} width={22} height={22} />
            </TouchableOpacity>
          </View>
        </Animated.View>
        <View style={styles.searchContainer}>
          <SearchMembers />
        </View>
      </View>
      <View style={styles.divider} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DEVICE_LARGE ? 12 : 10,
    // borderBottomWidth: 1,
  },
  memberInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  memberCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[15],
    marginLeft: DEVICE_LARGE ? 32 : 28,
  },
  btnsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    zIndex: 10,
  },
  btn: {
    marginLeft: 8,
  },
  searchContainer: {
    position: 'absolute',
    left: 80,
    zIndex: 2,
  },
  divider: {
    width: '100%',
    height: 3,
    // marginVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: GREY,
  },
});

export default MembersSearch;
