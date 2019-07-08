// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import GroupPhoto from './GroupPhoto';
import { getGroupName } from '../../utils/groups';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop score
 * @prop connectionTime
 * @prop photo
 */

class CurrentGroupCard extends React.Component<Props> {
  render() {
    const { group, navigation } = this.props;
    group.name = getGroupName(group);
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => navigation.navigate('CurrentGroupView', { group })}
      >
        <GroupPhoto group={group} />
        <Text style={styles.name}>{group.name}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 182,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    borderColor: '#e3e0e4',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginTop: 7.3,
  },
  score: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: 'green',
    marginTop: 7.3,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
  },
  moreIcon: {
    marginRight: 8,
  },
  approvalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  reviewButton: {
    width: 78,
    height: 47,
    borderRadius: 3,
    borderColor: '#4990e2',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#4990e2',
  },
});

export default connect()(withNavigation(CurrentGroupCard));
