// @flow

import * as React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import SearchGroups from './SearchGroups';
import EligibleGroupCard from './EligibleGroupCard';
import CurrentGroupCard from './CurrentGroupCard';
import BottomNav from '../BottomNav';

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
  eligibleGroups: number,
  navigation: {
    navigate: Function,
  },
};

class ConnectionsScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Groups',
    headerRight: <View />,
  });

  filterConnections = () =>
    this.props.connections.filter((item) =>
      `${item.firstName} ${item.lastName}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(this.props.searchParam.toLowerCase().replace(/\s/g, '')),
    );

  renderCurrentGroup = ({ item }) => (
    <CurrentGroupCard name={item.name} trustScore={item.trustScore} />
  );

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <SearchGroups />
        <View style={styles.eligibleContainer}>
          <Text style={styles.groupTitle}>ELIGIBLE</Text>
          <EligibleGroupCard
            names={['Sherry', 'Melissa', 'Bob']}
            trustScore="91.7"
          />
          <EligibleGroupCard names={['Nick', 'Anna']} trustScore="91.7" />
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>
              See all {this.props.eligibleGroups || 5}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.currentContainer}>
          <View style={styles.currentGroupsHeader}>
            <Text style={styles.groupTitle}>CURRENT</Text>
          </View>
          <FlatList
            data={groupData}
            renderItem={this.renderCurrentGroup}
            horizontal={true}
            keyExtractor={({ name }, index) => name + index}
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
    flex: 1,
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
    flex: 1,
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
});

export default connect((state) => state.main)(ConnectionsScreen);
