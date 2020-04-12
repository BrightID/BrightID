import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import CryptoJS from 'crypto-js';
import api from '@/Api/BrightId';
import MemberCard from './MemberCard';
import nacl from 'tweetnacl';
import { b64ToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import { convertPublicKey, convertSecretKey } from 'ed2curve';


export class InviteListScreen extends Component<Props, State> {
  static navigationOptions = () => ({
    title: 'Invite List',
    headerBackTitleVisible: false,
  });

  renderEligible = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => this.inviteToGroup(item)}>
        <MemberCard {...item} isAdmin={true} />
      </TouchableOpacity>
    );
  };

  inviteToGroup = async (connection) => {
    const { secretKey, navigation } = this.props;
    const { group } = navigation.state.params;

    try {
      const pub = convertPublicKey(b64ToUint8Array(connection.signingKey));
      const nonce = new Uint8Array(24);
      const msg = b64ToUint8Array(group.aesKey);
      const data = uInt8ArrayToB64(nacl.box(msg, nonce, pub, convertSecretKey(secretKey)));
      await api.invite(connection.id, group.id, data);
      Alert.alert(
        'Successful Invitaion',
        `You invited ${connection.name} successfully to the group`,
      );
      this.props.navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  getEligibles = () => {
    const { connections, navigation } = this.props;
    const { group } = navigation.state.params;
    return connections.filter(
      (item) =>
        !group.members?.includes(item.id) &&
        item.eligible_groups?.includes(group.id) &&
        (group.type !== 'primary' || !item.hasPrimaryGroup),
    );
  };

  render() {
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

export default connect(({ connections }) => ({ ...connections }))(
  InviteListScreen,
);
