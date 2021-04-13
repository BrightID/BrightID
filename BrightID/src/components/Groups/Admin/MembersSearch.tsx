import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import SearchMembers from '../../Helpers/SearchMembers';

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
    <View style={styles.container}>
      <Animated.View
        style={[{ opacity: fadeAnim }, styles.memberInfoContainer]}
      >
        <Text style={styles.memberCount}>
          {t('groups.text.membersCount', {
            count: group.members?.length,
          })}
        </Text>
        <Text style={styles.addMemberBtn}>A</Text>
      </Animated.View>
      <View style={styles.searchContainer}>
        <SearchMembers />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberCount: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    marginLeft: DEVICE_LARGE ? 32 : 28,
  },
  addMemberBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: DEVICE_LARGE ? 12 : 10,
  },
  searchContainer: {
    marginLeft: DEVICE_LARGE ? -110 : -65,
  },
});

export default MembersSearch;
