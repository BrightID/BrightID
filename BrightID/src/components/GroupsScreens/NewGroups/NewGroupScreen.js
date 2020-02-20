// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { connect } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationEvents } from 'react-navigation';
import SearchConnections from './SearchConnections';
import NewGroupCard from './NewGroupCard';
import store from '../../../store';
import { createNewGroup } from '../actions';
import { renderListOrSpinner } from './renderConnections';
import { clearNewGroupCoFounders } from '../../../actions';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

type State = {
  loading: boolean,
};

export class NewGroupScreen extends React.Component<Props, State> {

  state = {
    inviteOnly: false,
  };

  static navigationOptions = ({ navigation }: { navigation: navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: 'New Group',
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 11 }}
          onPress={params.setInviteOnly}
        >
          <Material name="dots-horizontal" size={32} color="#fff" />
        </TouchableOpacity>
      ),
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ setInviteOnly: this._setInviteOnly });
  }

  _setInviteOnly = () => {
    const buttons = [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'No',
        onPress: () => this.setState({ inviteOnly: false })
      },
      {
        text: 'Yes',
        onPress: () => this.setState({ inviteOnly: true })
      }
    ];
    Alert.alert(
      `Create Group`,
      `Do you want the group be invite only?`,
      buttons,
      {
        cancelable: true,
      },
    );
  };

  onWillBlur = () => {
    this.props.dispatch(clearNewGroupCoFounders());
  };

  filterConnections = () => {
    const { connections, searchParam } = this.props;
    return connections
      .filter((item) =>
        `${item.name}`
          .toLowerCase()
          .replace(/\s/g, '')
          .includes(searchParam.toLowerCase().replace(/\s/g, '')),
      )
      .filter((item) => item.status === 'verified');
  };

  cardIsSelected = (card) => {
    const { newGroupCoFounders } = this.props;
    return newGroupCoFounders.includes(card.id);
  };

  renderConnection = ({ item }) => (
    <NewGroupCard
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...item}
      selected={this.cardIsSelected(item)}
      groups={true}
      style={styles.connectionCard}
    />
  );

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <NavigationEvents onWillBlur={(payload) => this.onWillBlur()} />
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>CO-FOUNDERS</Text>
            <Text style={styles.infoText}>
              To create a group, you must select two co-founders
            </Text>
          </View>
          <SearchConnections navigation={this.props.navigation} />
          <View style={styles.mainContainer}>{renderListOrSpinner(this)}</View>
        </View>
        <View style={styles.createGroupButtonContainer}>
          <TouchableOpacity
            onPress={async () => {
              try {
                await store.dispatch(createNewGroup(this.state.inviteOnly));
                navigation.goBack();
              } catch (err) {
                console.log(err);
              }
            }}
            style={styles.createGroupButton}
          >
            <Text style={styles.buttonInnerText}>Create {this.state.inviteOnly ? ' an Invite Only ' : ''} Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    marginTop: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionsContainer: {
    flex: 1,
    width: '96.7%',
    borderTopWidth: 1,
    borderTopColor: '#e3e1e1',
  },
  moreIcon: {
    marginRight: 16,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    backgroundColor: '#fff',
    width: '96.7%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e1e1',
    marginBottom: 11,
  },
  titleText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.09)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  infoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
  },
  connectionCard: {
    marginBottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e1e1',
    width: '100%',
  },
  createGroupButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  createGroupButton: {
    backgroundColor: '#428BE5',
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 12,
    marginTop: 9,
    marginBottom: 30,
  },
  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default connect((state) => state)(NewGroupScreen);
