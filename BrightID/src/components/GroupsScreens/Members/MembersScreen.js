import React, { Component } from 'react';
import { StyleSheet, View, Alert, FlatList } from 'react-native';
import { connect } from 'react-redux';
import ActionSheet from 'react-native-actionsheet';
import { innerJoin } from 'ramda';
import api from '@/api/brightId';
import emitter from '@/emitter';
import { leaveGroup, dismissFromGroup } from '@/actions';
import EmptyList from '@/components/Helpers/EmptyList';
import { addAdmin } from '@/actions/groups';
import { ORANGE } from '@/utils/constants';
import MemberCard from './MemberCard';

export class MembersScreen extends Component<Props, State> {
  componentDidMount() {
    emitter.on('optionsSelected', this.showOptionsMenu);
  }

  componentWillUnmount() {
    emitter.off('optionsSelected', this.showOptionsMenu);
  }

  showOptionsMenu = () => {
    this.actionSheet.show();
  };

  performAction = (action) => {
    if (!this.actionSheet) return;
    action = this.actionSheet.props.options[action];
    if (action === 'Leave Group') {
      this.confirmLeaveGroup();
    } else if (action === 'Invite') {
      const { navigation, group } = this.props;
      navigation.navigate('InviteList', {
        group,
      });
    }
  };

  confirmDismiss = (user) => {
    const buttons = [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          const { dispatch, group } = this.props;
          try {
            await api.dismiss(user.id, group?.id);
            await dispatch(dismissFromGroup(user.id, group));
          } catch (err) {
            Alert.alert('Error dismissing member from the group', err.message);
          }
        },
      },
    ];
    Alert.alert(
      `Dismiss Member`,
      `Are you sure you want to dismiss ${user.name} from this group?`,
      buttons,
      {
        cancelable: true,
      },
    );
  };

  confirmAddAdmin = (user) => {
    const buttons = [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          const { route, dispatch } = this.props;
          const group = route.params?.group;
          try {
            await api.addAdmin(user.id, group.id);
            await dispatch(addAdmin(user.id, group));
          } catch (err) {
            Alert.alert(
              `Error making ${user.name} admin for group`,
              err.message,
            );
          }
        },
      },
    ];
    Alert.alert(
      `Add admin`,
      `Are you sure you want to make ${user.name} an admin for this group?`,
      buttons,
      {
        cancelable: true,
      },
    );
  };

  confirmLeaveGroup = () => {
    const buttons = [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          const { group, navigation, dispatch } = this.props;
          try {
            await api.leaveGroup(group?.id);
            await dispatch(leaveGroup(group));
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error leaving group', err.message);
          }
        },
      },
    ];
    Alert.alert(
      `Leave Group`,
      `Are you sure you want to leave this group?`,
      buttons,
      {
        cancelable: true,
      },
    );
  };

  filterMembers = () => {
    const { searchParam } = this.props;
    const searchString = searchParam.toLowerCase().replace(/\s/g, '');
    return this.getMembers().filter((item) =>
      `${item.name}`.toLowerCase().replace(/\s/g, '').includes(searchString),
    );
  };

  renderMember = ({ item }) => {
    const { group } = this.props;
    const memberIsAdmin = group?.admins?.includes(item.id);
    const userIsAdmin = group?.admins?.includes(this.props.id);
    return (
      <MemberCard
        connectionDate={item.connectionDate}
        flaggers={item.flaggers}
        memberId={item.id}
        name={item.name}
        photo={item.photo}
        score={item.score}
        memberIsAdmin={memberIsAdmin}
        userIsAdmin={userIsAdmin}
        userId={this.props.id}
        handleDismiss={this.confirmDismiss}
        handleAddAdmin={this.confirmAddAdmin}
      />
    );
  };

  getMembers = () => {
    const { connections, name, id, photo, score, group } = this.props;
    // return a list of connections filtered by the members of this group
    if (!group) return [];

    return [{ id, name, photo, score }].concat(
      innerJoin(
        (connection, member) => connection.id === member,
        connections,
        group.members,
      ),
    );
  };

  render() {
    const { id, group } = this.props;
    let actions = ['Leave Group', 'cancel'];
    if (group?.admins?.includes(id)) {
      actions = ['Invite'].concat(actions);
    }

    return (
      <>
        <View style={styles.orangeTop} />
        <View style={styles.container}>
          <View testID="membersView" style={styles.mainContainer}>
            <View>
              <FlatList
                style={styles.membersContainer}
                data={this.filterMembers()}
                keyExtractor={({ id }, index) => id + index}
                renderItem={this.renderMember}
                contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <EmptyList title="No known members, invite some..." />
                }
              />
            </View>
          </View>
          <ActionSheet
            ref={(o) => {
              this.actionSheet = o;
            }}
            title="What do you want to do?"
            options={actions}
            cancelButtonIndex={actions.indexOf('cancel')}
            destructiveButtonIndex={actions.indexOf('Leave Group')}
            onPress={(index) => this.performAction(index)}
          />
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: 70,
    width: '100%',
    zIndex: 1,
  },
  membersContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 58,
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
  moreIcon: {
    marginRight: 16,
  },
  groupName: {
    fontFamily: 'ApexNew-Book',
    fontSize: 28,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    textAlign: 'center',
  },
  optionsOverlay: {
    backgroundColor: 'rgba(62,34,24,0.4)',
  },
  optionsContainer: {
    backgroundColor: '#fdfdfd',
    height: '12%',
    width: '105%',
    borderRadius: 5,
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fdfdfd',
    position: 'absolute',
    top: -18,
    right: 20,
  },
  optionsBox: {
    flexDirection: 'row',
    width: '90%',
    height: '70%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  leaveGroupText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 24,
    marginLeft: 30,
  },
  backButtonContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    paddingLeft: 10,
  },
  headerPhoto: {
    marginLeft: 11,
    borderRadius: 18,
    width: 36,
    height: 36,
  },
  backStyle: {
    paddingTop: 8,
    paddingLeft: 11,
  },
});

function mapStateToProps(state, ownProps) {
  // Refetch group from state, as the group object passed via route params may be out of date.
  const groupId = ownProps.route.params.group.id;
  const group = state.groups.groups.find((entry) => entry.id === groupId);
  if (!group) {
    console.log(`Did not find group for groupID ${groupId}`);
  }

  return {
    ...state.connections,
    ...state.user,
    group,
  };
}

export default connect(mapStateToProps)(MembersScreen);
