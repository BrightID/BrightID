// @flow

import * as React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
    ActivityIndicator,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import {NavigationEvents} from 'react-navigation';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchGroups from './SearchGroups';
import EligibleGroupCard from './EligibleGroupCard';
import CurrentGroupCard from './CurrentGroupCard';
import BottomNav from '../BottomNav';
import reloadUserInfo from "../../actions/reloadUserInfo";
import {obj2b64, objToUint8} from "../../utils/encoding";
import api from "../../Api/BrightIdApi";

/**
 * Groups screen of BrightID
 */

const groupData = [
  { name: 'Whisler Crew', trustScore: '94.5' },
  { name: 'Hawaii Fam', trustScore: '92.5' },
  { name: 'Henry McWellington', trustScore: '5.6' },
  { name: "Von Neuman's Mad Scientists", trustScore: '99.9' },
];

type Props = {
  connections: Array<{
    firstName: string,
    lastName: string,
    id: number,
  }>,
  searchParam: string,
  // eligibleGroups comes from store and contains list of user eligible groups.
  // eligibleGroups: number,
  navigation: {
    navigate: () => null,
  },
};

class ConnectionsScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Groups',
    headerRight: <View />,
  });

  state = {
      userInfoLoading: false
  };

  filterConnections = () =>
    this.props.connections.filter((item) =>
      `${item.firstName} ${item.lastName}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(this.props.searchParam.toLowerCase().replace(/\s/g, '')),
    );

  renderCurrentGroup = ({ item }) => (
    <CurrentGroupCard name={item.nameornym} trustScore={item.score} />
  );

  refreshUserInfo = async () => {
      let {dispatch} = this.props;
      this.setState({userInfoLoading: true});
      await dispatch(reloadUserInfo());
      this.setState({userInfoLoading: false});
  };

  getTwoEligibleGroup(){
      let {eligibleGroups} = this.props;
      let groups = eligibleGroups.filter(group => group.isNew);
      if(groups.length < 2){
          Array.prototype.push.apply(groups, eligibleGroups.filter(group => !group.isNew));
      }
      if(groups.length > 2)
          groups = [groups[0], groups[1]];
      return groups;
  }

  mapPublicKeysToNames(publicKeys){
      let {connections} = this.props;
      let names = [];
      let user = api.urlSafe(obj2b64(this.props.publicKey));
      publicKeys.map(publicKey => {
          if(publicKey === user)
              names.push('You');
          else {
              let findedConnection = connections.find(connection => api.urlSafe(obj2b64(connection.publicKey)) === publicKey);
              names.push(findedConnection ? findedConnection.nameornym.split(' ')[0] : 'Unknown');
          }
      });
      return names;
  }

  render() {
    const { navigation, currentGroups, publicKey } = this.props;
    let twoEligibleGroups = this.getTwoEligibleGroup();
    return (
      <View style={styles.container}>
          <NavigationEvents
              onDidFocus={this.refreshUserInfo}
          />
        <SearchGroups />
        <View style={styles.eligibleContainer}>
          <Text style={styles.groupTitle}>ELIGIBLE</Text>
            {this.state.userInfoLoading && (
                <View style={styles.alignCenter}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}
            {twoEligibleGroups.map(group => (
                <EligibleGroupCard
                    key={group.id}
                    groupId={group.id}
                    names={this.mapPublicKeysToNames(group.knownMembers)}
                    alreadyIn={group.knownMembers.indexOf(api.urlSafe(obj2b64(publicKey))) >= 0}
                    trustScore={group.trustScore}
                />
            ))}
          {/*<EligibleGroupCard*/}
            {/*names={['Sherry', 'Melissa', 'Bob']}*/}
            {/*trustScore="92"*/}
          {/*/>*/}
          {/*<EligibleGroupCard names={['Brent', 'Nick', 'Anna']} trustScore="" />*/}
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>
              See all {this.props.eligibleGroups.length || 5}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.currentContainer}>
          <View style={styles.currentGroupsHeader}>
            <Text style={styles.groupTitle}>CURRENT</Text>
          </View>
          <FlatList
            data={currentGroups}
            renderItem={this.renderCurrentGroup}
            horizontal={true}
            keyExtractor={({ id }, index) => id}
          />
          <View style={styles.addGroupButtonContainer}>
            <TouchableOpacity
              style={styles.addGroupButton}
              onPress={() => {
                navigation.navigate('NewGroup');
              }}
            >
              <Material size={41} name="plus" color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <BottomNav navigation={navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  eligibleContainer: {
    backgroundColor: '#fff',
    marginTop: 7,
    width: '100%',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  groupTitle: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    paddingTop: 5,
    paddingBottom: 5,
  },

  seeAllButton: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    borderTopColor: '#e3e0e4',
    borderTopWidth: 1,
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
  currentContainer: {
    backgroundColor: '#fff',
    marginTop: 9,
    width: '100%',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  currentGroupRow: {
    width: '100%',
    flexDirection: 'row',
  },
  addGroupButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 100,
    right: 18,
    bottom: 12,
  },
  addGroupButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f98961',
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  alignCenter: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default connect((state) => state.main)(ConnectionsScreen);
