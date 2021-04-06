import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { encryptAesKey } from '@/utils/invites';
import EmptyList from '@/components/Helpers/EmptyList';
import { ORANGE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import i18next from 'i18next';
import { selectAllConnections } from '@/actions';
import { selectNodeApi } from '@/reducer/settingsSlice';
import MemberCard from './MemberCard';

const ITEM_HEIGHT = DEVICE_LARGE ? 94 : 80;
const ITEM_MARGIN = DEVICE_LARGE ? 11.8 : 6;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT + ITEM_MARGIN,
  offset: (ITEM_HEIGHT + ITEM_MARGIN) * index,
  index,
});

export class InviteListScreen extends Component {
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
    const { navigation, route, api } = this.props;
    const group = route.params?.group;

    try {
      const data = await encryptAesKey(group?.aesKey, connection.signingKey);
      await api.invite(connection.id, group?.id, data);
      Alert.alert(
        i18next.t('groups.alert.title.inviteSuccess'),
        i18next.t('groups.alert.text.inviteSuccess', { name: connection.name }),
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert(i18next.t('common.alert.error'), err.message);
    }
  };

  getEligibles = () => {
    const { connections, route } = this.props;
    const group = route.params?.group;
    return connections.filter(
      (item) =>
        !group?.members?.includes(item.id) &&
        (group?.type !== 'primary' || !item.hasPrimaryGroup),
    );
  };

  render() {
    const { t } = this.props;
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
                <EmptyList title={t('groups.text.noEligibleConnection')} />
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
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 8,
  },
});

export default connect((state) => ({
  connections: selectAllConnections(state),
  api: selectNodeApi(state),
}))(withTranslation()(InviteListScreen));
