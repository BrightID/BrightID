import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import api from '@/api/brightId';
import { encryptAesKey } from '@/utils/invites';
import EmptyList from '@/components/Helpers/EmptyList';
import { ORANGE, DEVICE_LARGE } from '@/utils/constants';
import MemberCard from './MemberCard';

const ITEM_HEIGHT = DEVICE_LARGE ? 94 : 80;
const ITEM_MARGIN = DEVICE_LARGE ? 11.8 : 6;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT + ITEM_MARGIN,
  offset: (ITEM_HEIGHT + ITEM_MARGIN) * index,
  index,
});

export class InviteListScreen extends Component<Props, State> {
  renderEligible = ({ item, index }) => {
    return (
      <TouchableOpacity
        testID={`eligibleItem-${index}`}
        onPress={() => this.inviteToGroup(item)}
      >
        <MemberCard {...item} isAdmin={true} />
      </TouchableOpacity>
    );
  };

  inviteToGroup = async (connection) => {
    const { navigation, route } = this.props;
    const group = route.params?.group;

    try {
      const data = await encryptAesKey(group?.aesKey, connection.signingKey);
      await api.invite(connection.id, group?.id, data);
      Alert.alert(
        'Successful Invitation',
        `You invited ${connection.name} successfully to the group`,
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  getEligibles = () => {
    const { connections, route } = this.props;
    const group = route.params?.group;
    return connections.filter(
      (item) =>
        !group?.members?.includes(item.id) &&
        item.eligible_groups?.includes(group?.id) &&
        (group?.type !== 'primary' || !item.hasPrimaryGroup),
    );
  };

  render() {
    return (
      <>
        <View style={styles.orangeTop} />
        <View style={styles.container}>
          <View style={styles.mainContainer} testID="inviteListScreen">
            <FlatList
              style={styles.eligiblesContainer}
              contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
              data={this.getEligibles()}
              keyExtractor={({ id }, index) => id + index}
              renderItem={this.renderEligible}
              getItemLayout={getItemLayout}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyList title="No existing connections are eligible for this group, please come back later.." />
              }
            />
          </View>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  eligiblesContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
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
