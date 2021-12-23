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
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { getGroupName, ids2connections, knownMemberIDs } from '@/utils/groups';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import { WHITE, ORANGE, BLACK } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { toSearchString } from '@/utils/strings';
import { NodeApiContext } from '@/components/NodeApiGate';
import { updateGroup, updateMemberships } from '@/actions';
import store from '@/store';
import GroupCard from './GroupCard';
import { NoGroups } from './NoGroups';
import { compareCreatedDesc } from './models/sortingUtility';

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

export class GroupsScreen extends React.Component {
  // make api available through this.context
  static contextType = NodeApiContext;

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  renderGroup = ({ item, index }) => {
    const { navigation } = this.props;
    return (
      <TouchableOpacity
        testID={`groupItem-${index}`}
        onPress={() => navigation.navigate('Members', { group: item })}
      >
        <GroupCard group={item} />
      </TouchableOpacity>
    );
  };

  onRefresh = async () => {
    try {
      const { dispatch, groups } = this.props;
      const api = this.context;
      this.setState({ refreshing: true });
      const { id } = store.getState().user;
      const memberships = await api.getMemberships(id);
      dispatch(updateMemberships(memberships));
      groups.forEach((group) => {
        console.log(`Refreshing group ${group.id}`);
        api.getGroup(group.id).then((data) => {
          dispatch(updateGroup(data));
        });
      });
      this.setState({ refreshing: false });
    } catch (err) {
      console.log(err.message);
      this.setState({ refreshing: false });
    }
  };

  render() {
    const { navigation, groups, hasGroups, t } = this.props;
    const activeGroups = groups.filter(
      (group) => group.state == 'initiated' || group.state == 'verified',
    );
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
                data={activeGroups}
                keyExtractor={({ id }, index) => id + index}
                renderItem={this.renderGroup}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                getItemLayout={getItemLayout}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh}
                  />
                }
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
  }
}

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

function mapStateToProps(state) {
  const { groups: unfilteredGroups } = state.groups;
  const searchParam = toSearchString(state.groups.searchParam);
  const hasGroups = unfilteredGroups.length > 0;

  // apply search filter to groups array
  // NOTE: If below sorting/filtering gets too expensive at runtime use memoized selectors / reselect

  let groups;
  if (searchParam !== '') {
    groups = unfilteredGroups.filter((group) => {
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
    });
  } else {
    groups = [...unfilteredGroups];
  }

  // sort groups by creating timestamp, newest first
  groups.sort(compareCreatedDesc);

  return { groups, hasGroups };
}

export default connect(mapStateToProps)(withTranslation()(GroupsScreen));
