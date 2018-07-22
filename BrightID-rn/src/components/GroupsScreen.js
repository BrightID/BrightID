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
import SearchGroups from './SearchGroups';
import EligibleGroupCard from './EligibleGroupCard';
import CurrentGroupCard from './CurrentGroupCard';

/**
 * Connection screen of BrightID
 */

type Props = {
  connections: Array<{
    firstName: string,
    lastName: string,
    id: number,
  }>,
  searchParam: string,
};

class ConnectionsScreen extends React.Component<Props> {
  static navigationOptions = {
    title: 'Groups',
    headerRight: <View />,
  };

  filterConnections = () =>
    this.props.connections.filter((item) =>
      `${item.firstName} ${item.lastName}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(this.props.searchParam.toLowerCase().replace(/\s/g, '')),
    );
  render() {
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
          <Text style={styles.groupTitle}>CURRENT</Text>
          <View style={styles.currentGroupRow}>
            <CurrentGroupCard
              name="Whisler Crew"
              trustScore="94.5"
              left={true}
            />
            <CurrentGroupCard name="Hawaii Fam" trustScore="92.5" />
          </View>
        </View>
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
    borderTopColor: '#e3e0e4',
    borderTopWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
  },
  seeAllText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 18,
    color: '#4A8FE6',
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
    // alignItems: 'flex-start',
    // justifyContent: 'flex-start',
  },
});

export default connect((state) => state.main)(ConnectionsScreen);
