// @flow

import * as React from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Text,
} from 'react-native';
import { connect } from 'react-redux';
import fetchUserInfo from '@/actions/fetchUserInfo';
import { getGroupName, ids2connections, knownMemberIDs } from '@/utils/groups';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import GroupCard from './GroupCard';
import { NoGroups } from './NoGroups';
import SearchGroups from './SearchGroups';
import { compareJoinedDesc } from './models/sortingUtility';

/**
 * Group screen of BrightID
 * Displays a search input and list of Group Cards
 */

type State = {
  refreshing: boolean,
};

export class GroupsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('focus', () => {
      dispatch(fetchUserInfo());
    });
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
      const { dispatch } = this.props;
      this.setState({ refreshing: true });
      await dispatch(fetchUserInfo());
      this.setState({ refreshing: false });
    } catch (err) {
      console.log(err.message);
      this.setState({ refreshing: false });
    }
  };

  render() {
    const { navigation, groups, hasGroups } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }} testID="groupsScreen">
          <View style={styles.mainContainer}>
            {hasGroups && <SearchGroups navigation={navigation} />}
            <View style={styles.mainContainer}>
              <FlatList
                style={styles.groupsContainer}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
                data={groups}
                keyExtractor={({ id }, index) => id + index}
                renderItem={this.renderGroup}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh}
                  />
                }
                ListEmptyComponent={
                  hasGroups ? (
                    <Text testID="noMatchText" style={styles.emptyText}>
                      No group matches your search
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
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fdfdfd',
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
    fontSize: 20,
  },
});

function mapStateToProps(state) {
  let { groups } = state.groups;
  const searchParam = state.groups.searchParam.toLowerCase();
  const hasGroups = groups.length > 0;

  // apply search filter to groups array
  // NOTE: If below sorting/filtering gets too expensive at runtime use memoized selectors / reselect
  if (searchParam !== '') {
    groups = groups.filter((group) => {
      if (
        getGroupName(group)
          .toLowerCase()
          .includes(searchParam)
      ) {
        // direct group name match
        return true;
      } else {
        // check group members
        const allMemberNames = ids2connections(
          knownMemberIDs(group),
        ).map((member) => member.name.toLowerCase());
        for (const name of allMemberNames) {
          if (name.includes(searchParam)) {
            // stop looking if a match is found
            return true;
          }
        }
        return false;
      }
    });
  }

  // sort groups by joined timestamp, newest first
  groups.sort(compareJoinedDesc);

  return { groups, hasGroups };
}

export default connect(mapStateToProps)(GroupsScreen);
