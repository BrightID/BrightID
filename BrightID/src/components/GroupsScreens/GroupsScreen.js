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
import { getGroupName } from '@/utils/groups';
import GroupCard from './GroupCard';
import FloatingActionButton from '../FloatingActionButton';
import { NoGroups } from './NoGroups';
import SearchGroups from './SearchGroups';

/**
 * Group screen of BrightID
 * Displays a search input and list of Group Cards
 */

type State = {
  refreshing: boolean,
};

export class GroupsScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }: { navigation: navigation }) => ({
    title: 'Groups',
    headerBackTitleVisible: false,
  });

  constructor(props: Props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('willFocus', () => {
      dispatch(fetchUserInfo());
    });
  }

  renderGroup = ({ item }) => {
    const { navigation } = this.props;
    return (
      <TouchableOpacity
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

    let content;
    if (!hasGroups) {
      // user does not have any groups.
      content = <NoGroups navigation={navigation} />;
    } else {
      if (groups.length === 0) {
        // user does have groups, but set a filter that does not match any group
        content = (
          <>
            <SearchGroups navigation={navigation} />
            <View style={styles.mainContainer}>
              <View>
                <Text style={styles.emptyText}>
                  No group matches your search
                </Text>
              </View>
            </View>
          </>
        );
      } else {
        content = (
          <>
            <SearchGroups navigation={navigation} />
            <View style={styles.mainContainer}>
              <FlatList
                style={styles.groupsContainer}
                contentContainerStyle={{ paddingBottom: 50 }}
                data={groups}
                keyExtractor={({ id }, index) => id + index}
                renderItem={this.renderGroup}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh}
                  />
                }
              />
            </View>
          </>
        );
      }
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.mainContainer}>{content}</View>
          {groups.length > 0 && (
            <FloatingActionButton
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
    groups = groups.filter((group) =>
      getGroupName(group)
        .toLowerCase()
        .includes(searchParam),
    );
  }

  return { groups, hasGroups };
}

export default connect(mapStateToProps)(GroupsScreen);
