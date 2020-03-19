// @flow

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import MemberCard from './MemberCard';
import CryptoJS from 'crypto-js';
import api from '../../../Api/BrightId';

type State = {
  eligibles: string[],
};

export class InviteListScreen extends Component<Props, State> {
  
  static navigationOptions = () => ({
    title: 'Invite List',
  });

  // eslint-disable-next-line react/jsx-props-no-spreading
  renderEligible = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => this.inviteToGroup(item)}
      >
        <MemberCard {...item} />
      </TouchableOpacity>
    );
  };

  inviteToGroup = async (connection) => {
    const group = this.props.navigation.state.params.group;
    try {
      let data = '';
      if (connection.aesKey) {
        data = CryptoJS.AES.encrypt(group.aesKey, connection.aesKey).toString();
      }
      await api.invite(connection.id, group.id, data);
      Alert.alert('Successful Invitaion', `You invited ${connection.name} successfully to the group`);
      this.props.navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  getEligibles = () => {
    if (this.eligibles) return this.eligibles;
    const { connections, navigation } = this.props;
    const group = navigation.state.params.group;
    this.eligibles = connections.filter((item) => {
      return (
        (! group.members.includes(item.id)) &&
        item.eligible_groups &&
        item.eligible_groups.includes(group.id) &&
        (group.type !== 'primary' || ! item.hasPrimaryGroup)
      );
    });
    return this.eligibles;
  };

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.mainContainer}>
            <FlatList
              style={styles.eligiblesContainer}
              data={this.getEligibles()}
              keyExtractor={({ id }, index) => id + index}
              renderItem={this.renderEligible}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  eligiblesContainer: {
    flex: 1,
  },
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
  
});

export default connect((state) => state)(InviteListScreen);
