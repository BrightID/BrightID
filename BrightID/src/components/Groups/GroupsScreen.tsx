import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { createSelector } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '@/store';
import fetchUserInfo from '@/actions/fetchUserInfo';
import { getGroupName, ids2connections, knownMemberIDs } from '@/utils/groups';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import { WHITE, ORANGE, BLACK } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { toSearchString } from '@/utils/strings';
import GroupCard from './GroupCard';
import { NoGroups } from './NoGroups';
import { compareJoinedDesc } from './models/sortingUtility';

/**
 * Group screen of BrightID
 * Displays a search input and list of Group Cards
 */
// type State = {
//   refreshing: boolean;
// };

const ITEM_HEIGHT = DEVICE_LARGE ? 94 : 80;
const ITEM_MARGIN = DEVICE_LARGE ? 11.8 : 6;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT + ITEM_MARGIN,
  offset: (ITEM_HEIGHT + ITEM_MARGIN) * index,
  index,
});

/**
 * Selectors
 */

const groupsSelector = createSelector(
  (state: State) => state.groups.groups,
  (state: State) => toSearchString(state.groups.searchParam),
  (groups, searchParam) => {
    if (searchParam !== '') {
      return groups
        .filter((group) => {
          if (toSearchString(getGroupName(group)).includes(searchParam)) {
            // direct group name match
            return true;
          } else {
            // check group members
            const allMemberNames = ids2connections(
              knownMemberIDs(group),
            ).map((member) => toSearchString(member.name));
            for (const name of allMemberNames) {
              if (name.includes(searchParam)) {
                // stop looking if a match is found
                return true;
              }
            }
            return false;
          }
        })
        .sort(compareJoinedDesc);
    } else {
      return groups.sort(compareJoinedDesc);
    }
  },
);

/**
 * Groups Screen Component
 */
export const GroupsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const hasGroups = useSelector((state) => state.groups.groups.length > 0);
  const groups = useSelector(groupsSelector);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchUserInfo()).then(() => {
      setRefreshing(false);
    });
    const timeoutId = setTimeout(() => {
      setRefreshing(false);
    }, 3000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [dispatch]);

  useFocusEffect(onRefresh);

  const renderGroup = ({ item, index }) => {
    return (
      <TouchableOpacity
        testID={`groupItem-${index}`}
        onPress={() => navigation.navigate('Members', { group: item })}
      >
        <GroupCard group={item} />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="groupsScreen">
        <View style={styles.mainContainer}>
          <View style={styles.mainContainer}>
            <FlatList
              style={styles.groupsContainer}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
              testID="groupsFlatList"
              data={groups}
              keyExtractor={({ id }, index) => id + index}
              renderItem={renderGroup}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              getItemLayout={getItemLayout}
              onRefresh={onRefresh}
              refreshing={refreshing}
              ListEmptyComponent={
                hasGroups ? (
                  <Text testID="noMatchText" style={styles.emptyText}>
                    {t('groups.text.noGroupsMatchSearch')}
                  </Text>
                ) : (
                  <NoGroups navigation={navigation} />
                )
              }
            />
          </View>
        </View>
        {groups.length > 0 && (
          <FloatingActionButton
            testID="addGroupBtn"
            onPress={() => navigation.navigate('GroupInfo')}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 8,
  },
  groupsContainer: {
    flex: 1,
  },
  moreIcon: {
    marginRight: 16,
  },
  emptyText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[20],
    color: BLACK,
  },
});

export default GroupsScreen;
