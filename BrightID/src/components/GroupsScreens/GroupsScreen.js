// @flow

import * as React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { splitEvery } from 'ramda';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import EligibleGroupCard from './EligibleGroups/EligibleGroupCard';
import CurrentGroupCard from './CurrentGroups/CurrentGroupCard';
import {
  NoCurrentGroups,
  EmptyFullScreen,
  NoEligibleGroups,
} from './EmptyGroups';
import fetchUserInfo from '../../actions/fetchUserInfo';

const ICON_SIZE = 36;

export class GroupsScreen extends React.Component<Props, State> {
  static navigationOptions = () => ({
    title: 'Groups',
    headerRight: () => <View />,
  });

  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('didFocus', () => {
      dispatch(fetchUserInfo());
    });
  }

  // eslint-disable-next-line class-methods-use-this
  renderCurrentGroups(groups) {
    return groups.map(([group1, group2]) => (
      <View style={styles.currentGroupRow} key={group1.id}>
        {!!group1 && <CurrentGroupCard group={group1} />}
        {!!group2 && <CurrentGroupCard group={group2} />}
      </View>
    ));
  }

  getTwoEligibleGroups() {
    let { eligibleGroups } = this.props;
    let groups = eligibleGroups
      .filter((group: { isNew: boolean }) => group.isNew)
      .concat(eligibleGroups.filter((group) => !group.isNew));
    return groups
      .slice(0, 2)
      .map((group) => (
        <EligibleGroupCard group={group} key={`${group.id}2elig`} />
      ));
  }

  render() {
    try {
      let { navigation, currentGroups, eligibleGroups } = this.props;
      const primaryGroup = currentGroups.filter(group => group.type=='primary')[0];
      currentGroups = currentGroups.filter(group => group.type!='primary');
      const groupPairs =
        currentGroups.length > 2
          ? splitEvery(2, currentGroups)
          : [currentGroups];
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.mainContainer}>
              {!primaryGroup && !eligibleGroups.length && !currentGroups.length && (
                <EmptyFullScreen navigation={navigation} />
              )}
              {!!eligibleGroups.length && (
                <View style={styles.eligibleContainer}>
                  <Text style={styles.eligibleGroupTitle}>INVITATIONS</Text>
                  {this.getTwoEligibleGroups()}
                  <View style={styles.eligibleBottomBorder} />
                  {eligibleGroups.length > 2 && (
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
                  )}
                </View>
              )}
              {(!!currentGroups.length || primaryGroup) && !eligibleGroups.length && (
                <NoEligibleGroups navigation={navigation} />
              )}
              {primaryGroup && (
                <View style={styles.primaryContainer}>
                  <Text style={styles.currentGroupTitle}>PRIMARY</Text>
                  <View style={styles.primaryGroupRow} key={primaryGroup.id}>
                    <CurrentGroupCard group={primaryGroup} />
                  </View>
                </View>
              )}
              {!!currentGroups.length && (
                <View style={styles.currentContainer}>
                  <Text style={styles.currentGroupTitle}>GENERAL</Text>
                  {this.renderCurrentGroups(groupPairs)}
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
          </ScrollView>
        </View>
      );
    } catch (err) {
      err instanceof Error ? console.warn(err.message) : console.log(err);
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
    height: '100%',
    // borderBottomWidth: 2,
    // borderBottomColor: 'red',
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
  primaryContainer: {
    backgroundColor: '#fff',
    paddingTop: 9,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    fontFamily: 'ApexNew-Medium',
    fontSize: 22,
    paddingBottom: 5,
    color: '#4a90e2',
    paddingTop: 9,
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
  },
  currentGroupTitle: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 22,
    color: '#4a90e2',
    padding: 9,
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
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
  primaryGroupRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
  },
  currentGroupRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
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
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    height: 90,
    borderTopColor: '#e3e0e4',
    borderTopWidth: 1,
  },
  scrollView: {
    width: '100%',
    minHeight: '100%',
    height: '100%',
    flex: 1,
  },
});

export default connect((state) => state)(GroupsScreen);
