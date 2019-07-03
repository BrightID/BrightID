// @flow

import * as React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { connect } from 'react-redux';

class Verifications extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Verifications',
    headerRight: <View />,
  });

  componentDidMount(){
    const {host, context, id} = this.props.navigation.state.params;
    //TODO: get information about the context from the host
    Alert.alert(
      'Link Verification?',
      `Do you want to allow ${context} to link the account with id ${id} to your BrightID verification?`,
      [
        {
          text: 'Yes',
        },
        {
          text: 'No',
          style: 'cancel',
        }
      ]
    );
  }

  render() {
    return (
      <View style={styles.container} />
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

export default connect((state) => state.main)(Verifications);
