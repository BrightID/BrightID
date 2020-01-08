// @flow

import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';

class CofoundGroupReview extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Review Group',
    headerRight: () => <View />,
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

export default connect((state) => state)(CofoundGroupReview);
