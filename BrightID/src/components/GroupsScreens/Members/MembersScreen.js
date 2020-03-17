// @flow

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { connect } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionSheet from 'react-native-actionsheet';
import MemberCard from './MemberCard';
import { innerJoin } from 'ramda';
import api from '../../../Api/BrightId';
import emitter from '../../../emitter';
import { leaveGroup, dismissFromGroup } from '../../../actions';
import { getGroupName } from '@/utils/groups';
import GroupPhoto from '../GroupPhoto';

export class MembersScreen extends Component<Props, State> {

  static navigationOptions = ({ navigation }: { navigation: navigation }) => {
    const { group } = navigation.state.params;
    return {
      title: getGroupName(group),
      headerTitleStyle: { fontSize: 16 },
      headerBackTitleVisible: false,
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 11 }}
          onPress={() => {
            emitter.emit('optionsSelected');
          }}
        >
          <Material name="dots-horizontal" size={32} color="#fff" />
        </TouchableOpacity>
      ),
      headerLeft: () => {
        const group = navigation.state.params.group;
        return (
          <View style={{flexDirection:'row'}}>
            <Material
              style={styles.backStyle}
              name="arrow-left" size={24} color="#fff"
              onPress={ () => {
                navigation.goBack();
              }}
            />
            {(group.photo && group.photo.uri) ? (<Image
              source={{
                uri: group.photo.uri,
              }}
              style={styles.headerPhoto}
            />) : null}
          </View>
        );
      },
      headerShown: true,
    };
  };

  showOptionsMenu = () => {
    this.actionSheet.show();
  };

  componentDidMount() {
    const { navigation } = this.props;
    emitter.on('optionsSelected', this.showOptionsMenu);
  }

  componentWillUnmount() {
    emitter.off('optionsSelected', this.showOptionsMenu);
  }

  confirmDismiss = (user) => {
    const buttons = [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          const { navigation, dispatch } = this.props;
          const group = navigation.state.params.group;
          try {
            await api.dismiss(user.id, group.id);
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

  performAction = (action) => {
    if (!this.actionSheet) return;
    action = this.actionSheet.props.options[action];
    if (action === 'Leave Group') {
      this.confirmLeaveGroup();
    } else if (action === 'Invite') {
      const { navigation } = this.props;
      navigation.navigate('InviteList', {
        group: navigation.state.params.group,
      });
    }
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
          const { navigation, dispatch } = this.props;
          const group = navigation.state.params.group;
          try {
            await api.leaveGroup(group.id);
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
      `${item.name}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(searchString),
    );
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  renderMember = ({ item }) => {
    const { group } = this.props.navigation.state.params;
    const isAdmin = group.admins.includes(this.props.id);
    const isItemAdmin = group.admins.includes(item.id);
    const handler = (isAdmin && ! isItemAdmin) ? this.confirmDismiss : null;
    return (
      <MemberCard {...item} menuHandler={handler}/>
    );
  };

  getMembers = () => {
    const { navigation, connections, name, id, photo, score } = this.props;
    // return a list of connections filtered by the members of this group
    return [{ id, name, photo, score }].concat(innerJoin(
      (connection, member) => connection.id === member,
      connections,
      navigation.state.params.group.members,
    ));
  };

  render() {
    const { navigation, id } = this.props;
    const { group } = this.props.navigation.state.params;
    let actions = ['Leave Group', 'cancel'];
    if (group.admins && group.admins.includes(id)) {
      actions = ['Invite'].concat(actions);
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mainContainer}>
          <View>
            <FlatList
              style={styles.membersContainer}
              data={this.filterMembers()}
              keyExtractor={({ id }, index) => id + index}
              renderItem={this.renderMember}
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
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  membersContainer: {
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
    borderRadius: 24,
    width: 48,
    height: 48
  },
  backStyle: {
    paddingTop: 8,
    paddingLeft: 11
  }
});

export default connect((state) => state)(MembersScreen);
