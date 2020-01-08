// @flow

import * as React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { NavigationEvents } from 'react-navigation';
import { splitEvery, take } from 'ramda';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import EligibleGroupCard from './EligibleGroupCard';
import CurrentGroupCard from './CurrentGroupCard';
import BottomNav from '../BottomNav';
import fetchUserInfo from '../../actions/fetchUserInfo';
import {
  NoCurrentGroups,
  EmptyFullScreen,
  NoEligibleGroups,
} from './EmptyGroups';

const ICON_SIZE = 36;

export class GroupsScreen extends React.Component<Props, State> {
  static navigationOptions = () => ({
    title: 'Groups',
    headerRight: () => <View />,
  });

  renderCurrentGroups({ item }) {
    const [group1, group2] = item;
    return (
      <View style={styles.currentGroupRow}>
        {!!group1 && <CurrentGroupCard group={group1} />}
        {!!group2 && <CurrentGroupCard group={group2} />}
      </View>
    );
  }

  refreshUserInfo = async () => {
    console.log('refreshing user info');
    await this.props.dispatch(fetchUserInfo());
  };

  getTwoEligibleGroups() {
    let { eligibleGroups } = this.props;
    let groups = eligibleGroups
      .filter((group: { isNew: boolean }) => group.isNew)
      .concat(eligibleGroups.filter((group) => !group.isNew));
    if (groups.length === 1) groups.push('');
    return take(2, groups).map((group, i) =>
      group ? (
        <EligibleGroupCard key={group.id} group={group} />
      ) : (
        <View key={i} style={styles.emptyContainer} />
      ),
    );
  }

  render() {
    try {
      const { navigation, currentGroups, eligibleGroups } = this.props;
      const groupPairs =
        currentGroups.length > 2
          ? splitEvery(2, currentGroups)
          : [currentGroups];
      console.log(groupPairs);
      return (
        <View style={styles.container}>
          <View style={styles.mainContainer}>
            <NavigationEvents onDidFocus={this.refreshUserInfo} />
            {!eligibleGroups.length && !currentGroups.length && (
              <EmptyFullScreen navigation={navigation} />
            )}
            {!!eligibleGroups.length && (
              <View style={styles.eligibleContainer}>
                <Text style={styles.eligibleGroupTitle}>ELIGIBLE</Text>
                {this.getTwoEligibleGroups()}
                <View style={styles.eligibleBottomBorder} />
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => {
                    navigation.navigate('EligibleGroups');
                  }}
                >
                  <Text style={styles.seeAllText}>
                    See all {this.props.eligibleGroups.length}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {!!currentGroups.length && !eligibleGroups.length && (
              <NoEligibleGroups navigation={navigation} />
            )}

            {!!currentGroups.length && (
              <View style={styles.currentContainer}>
                <Text style={styles.currentGroupTitle}>CURRENT</Text>
                <FlatList
                  data={groupPairs}
                  renderItem={this.renderCurrentGroups}
                />
              </View>
            )}
            {!!eligibleGroups.length && !currentGroups.length && (
              <NoCurrentGroups navigation={navigation} />
            )}
            {!!currentGroups.length && !!eligibleGroups.length && (
              <View style={styles.addGroupButtonContainer}>
                <TouchableOpacity
                  style={styles.addGroupButton}
                  onPress={() => {
                    navigation.navigate('NewGroup');
                  }}
                >
                  <Material
                    size={ICON_SIZE}
                    name="plus"
                    color="#fff"
                    style={{ width: ICON_SIZE, height: ICON_SIZE }}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <BottomNav navigation={navigation} />
        </View>
      );
    } catch (e) {
      Alert.alert(e.message || 'Error', e.stack);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    width: '100%',
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  eligibleContainer: {
    // backgroundColor: '#fff',
    marginTop: 7,
    width: '100%',
    maxHeight: '55%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  currentContainer: {
    backgroundColor: '#fff',
    paddingTop: 9,
    width: '100%',
    minHeight: '45%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  eligibleGroupTitle: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    paddingBottom: 5,
    paddingTop: 9,
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
  },
  currentGroupTitle: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    paddingBottom: 5,
    paddingTop: 9,
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
    color: '#4a4a4a',
    textShadowColor: 'rgba(0, 0, 0, 0.09)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  eligibleBottomBorder: {
    borderTopColor: '#e3e0e4',
    borderTopWidth: 1,
    width: '100%',
  },
  seeAllButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    backgroundColor: '#fff',
  },
  seeAllText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 18,
    color: '#4A8FE6',
  },

  currentGroupsHeader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: '#e3e0e4',
    borderBottomWidth: 1,
  },
  currentGroupRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  addGroupButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 100,
    right: 25,
    bottom: 25,
  },
  addGroupButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f98961',
    width: 54,
    height: 54,
    borderRadius: 27,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  alignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    width: '90%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    height: 90,
    borderTopColor: '#e3e0e4',
    borderTopWidth: 1,
  },
});

export default connect((state) => state)(GroupsScreen);
