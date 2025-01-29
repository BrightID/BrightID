import * as React from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  RefreshControl,
  Text,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { useDispatch, useSelector } from '@/store/hooks';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import { WHITE, ORANGE, BLACK } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { useNodeApiContext } from '@/context/NodeApiContext';
import {
  allGroupsSelector,
  filteredGroupsSelector,
  updateGroup,
  updateMemberships,
} from '@/actions';
import { GroupCard } from './GroupCard';
import { NoGroups } from './NoGroups';
import { RootStackParamList } from '@/routes/navigationTypes';

/**
 * Group screen of BrightID
 * Displays a search input and list of Group Cards
 */

const ITEM_HEIGHT = DEVICE_LARGE ? 94 : 80;
const ITEM_MARGIN = DEVICE_LARGE ? 11.8 : 6;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT + ITEM_MARGIN,
  offset: (ITEM_HEIGHT + ITEM_MARGIN) * index,
  index,
});

type Props = DrawerScreenProps<RootStackParamList, 'Groups'>;

export const GroupsScreen = ({ navigation }: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { api } = useNodeApiContext();
  const allGroups = useSelector(allGroupsSelector);
  const filteredGroups = useSelector(filteredGroupsSelector);
  const { id } = useSelector((state) => state.user);

  const renderGroup = ({ item, index }: { item: Group; index: number }) => {
    return (
      <TouchableOpacity
        testID={`groupItem-${index}`}
        onPress={() => navigation.navigate('Members', { group: item })}
      >
        <GroupCard group={item} index={index} />
      </TouchableOpacity>
    );
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const memberships = await api.getMemberships(id);
      dispatch(updateMemberships(memberships));
      for (const group of allGroups) {
        console.log(`Refreshing group ${group.id}`);
        const groupInfo = await api.getGroup(group.id);
        dispatch(updateGroup(groupInfo));
      }
      setRefreshing(false);
    } catch (err) {
      console.log(err.message);
      setRefreshing(false);
    }
  };

  const hasGroups = allGroups.length;

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
              data={filteredGroups}
              keyExtractor={({ id }, index) => id + index}
              renderItem={renderGroup}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              getItemLayout={getItemLayout}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                hasGroups ? (
                  <Text testID="noMatchText" style={styles.emptyText}>
                    {t('groups.text.noGroupsMatchSearch')}
                  </Text>
                ) : (
                  <NoGroups />
                )
              }
            />
          </View>
        </View>
        {allGroups.length > 0 && (
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
