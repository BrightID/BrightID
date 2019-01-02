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

const ICON_SIZE = 36;

type Props = Main;

class CofoundGroupReview extends React.Component<Props, State> {
  static navigationOptions = () => ({
    title: 'Review Group',
    headerRight: <View />,
  });

  render() {
    return (
      <View style={styles.container}>
        <Text>Review Group</Text>
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

export default connect((state) => state.main)(CofoundGroupReview);
