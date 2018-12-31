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
import { NavigationEvents } from 'react-navigation';
import { splitEvery, take } from 'ramda';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchGroups from './SearchGroups';
import EligibleGroupCard from './EligibleGroupCard';
import CurrentGroupCard from './CurrentGroupCard';
import BottomNav from '../BottomNav';
import fetchUserInfo from '../../actions/fetchUserInfo';
import {
  NoCurrentGroups,
  EmptyFullScreen,
  NoEligibleGroups,
} from './EmptyGroups';

const ICON_SIZE = 36;

type Props = Main;

class EligibleGroupView extends React.Component<Props, State> {
  static navigationOptions = () => ({
    title: 'Eligible Groups',
    headerRight: <View />,
  });

  render() {
    return (
      <View style={styles.container}>
        <Text>Eligible Group View</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default connect((state) => state.main)(EligibleGroupView);
