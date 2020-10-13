import * as React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { connect } from 'react-redux';
import store from '@/store';
import emitter from '@/emitter';
import { clearNewGroupCoFounders } from '@/actions';
import { DEVICE_TYPE, ORANGE, DEVICE_LARGE } from '@/utils/constants';
import Spinner from 'react-native-spinkit';
import { createNewGroup } from '../actions';
import NewGroupCard from './NewGroupCard';

// type State = {
//   creating: boolean,
// };

const ITEM_HEIGHT = DEVICE_LARGE ? 94 : 80;
const ITEM_MARGIN = DEVICE_LARGE ? 11.8 : 6;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT + ITEM_MARGIN,
  offset: (ITEM_HEIGHT + ITEM_MARGIN) * index,
  index,
});

export class NewGroupScreen extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      creating: false,
      creationState: 'uploading group photo',
    };
  }

  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('focus', () => {
      emitter.on('creatingGroupChannel', this.updateCreationState);
    });
    navigation.addListener('blur', () => {
      dispatch(clearNewGroupCoFounders());
      emitter.off('creatingGroupChannel', this.updateCreationState);
    });
  }

  updateCreationState = (creationState) => {
    this.setState({ creationState });
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

  createGroup = async () => {
    try {
      this.setState({ creating: true });
      const { route, navigation } = this.props;
      const { photo, name, isPrimary } = route.params;
      const type = isPrimary ? 'primary' : 'general';
      const res = await store.dispatch(createNewGroup(photo, name, type));
      if (res) {
        navigation.navigate('Groups');
      } else {
        this.setState({ creating: false });
      }
    } catch (err) {
      this.setState({ creating: false });
    }
  };

  renderButtonOrSpinner = () => {
    const buttonDisabled = this.props.newGroupCoFounders.length < 2;
    return !this.state.creating ? (
      <View style={styles.createGroupButtonContainer}>
        <TouchableOpacity
          testID="createNewGroupBtn"
          onPress={this.createGroup}
          style={
            buttonDisabled
              ? { ...styles.createGroupButton, opacity: 0.4 }
              : styles.createGroupButton
          }
          disabled={buttonDisabled}
        >
          <Text style={styles.buttonInnerText}>Create Group</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View style={styles.loader}>
        <Text style={styles.textInfo}>{this.state.creationState} ...</Text>
        <Spinner isVisible={true} size={97} type="Wave" color="#4990e2" />
      </View>
    );
  };

  renderConnection = ({ item }) => (
    <NewGroupCard
      {...item}
      selected={this.cardIsSelected(item)}
      groups={true}
      style={styles.connectionCard}
    />
  );

  render() {
    const connections = this.filterConnections();
    return (
      <>
        <View style={styles.orangeTop} />
        <View style={styles.container}>
          <View testID="newGroupScreen" style={styles.mainContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>CO-FOUNDERS</Text>
              <Text style={styles.infoText}>
                To create a group, you must select two co-founders
              </Text>
            </View>
            <View style={styles.mainContainer}>
              {connections.length > 0 ? (
                <FlatList
                  style={styles.connectionsContainer}
                  contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
                  data={connections}
                  keyExtractor={({ id }, index) => id + index}
                  renderItem={this.renderConnection}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  getItemLayout={getItemLayout}
                />
              ) : (
                <View>
                  <Text style={styles.emptyText}>No connections</Text>
                </View>
              )}
            </View>
          </View>
          {this.renderButtonOrSpinner()}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 58,

    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
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
  emptyText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
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

    marginBottom: DEVICE_TYPE === 'large' ? 11 : 0,
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
    marginBottom: DEVICE_TYPE === 'large' ? 30 : 25,
  },

  buttonInnerText: {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  textInfo: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    margin: 18,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

export default connect(({ connections, groups }) => ({
  newGroupCoFounders: groups.newGroupCoFounders,
  connections: connections.connections,
  searchParam: connections.searchParam,
}))(NewGroupScreen);
