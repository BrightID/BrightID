// @flow

import * as React from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import fetchUserInfo from '@/actions/fetchUserInfo';
import { DEVICE_TYPE } from '@/utils/constants';
import GroupCard from './GroupCard';
import FloatingActionButton from '../FloatingActionButton';
import { NoGroups } from './NoGroups';

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
    const { navigation, groups } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.mainContainer}>
            {groups.length > 0 ? (
              <FlatList
                style={styles.groupsContainer}
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
            ) : (
              <NoGroups navigation={navigation} />
            )}
          </View>
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

export default connect(({ groups }) => ({ ...groups }))(GroupsScreen);
