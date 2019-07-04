// @flow

import * as React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { connect } from 'react-redux';

import server from '../Api/server';
import api from '../Api/BrightId';

class Verifications extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Verifications',
    headerRight: <View />,
  });

  componentDidMount(){
    const {host, context, id} = this.props.navigation.state.params;
    const oldHost = server.baseUrl;
    let contextInfo;
    try{
      server.update(host);
      contextInfo = api.getContext(context);
    }
    finally {
      server.update(oldHost);
    }

    if (contextInfo) {

      Alert.alert(
        'Link Verification?',
        `Do you want to allow ${context} to link the account with id ${id} to your BrightID verification?`,
        [
          {
            text: 'Yes',
            onPress: () => this.linkVerification(host, context, contextInfo, id)
          },
          {
            text: 'No',
            style: 'cancel',
            onPress: () => { this.props.navigation.goBack(); }
          }
        ]
      );
    }
    else {
      this.props.navigation.goBack();
    }
  }

  render() {
    return (
      <View style={styles.container} />
    );
  }

  linkVerification(host, context, contextInfo, id) {
    const oldHost = server.baseUrl;
    let verification;
    try{
      server.update(host);
      verification = api.getVerification(context, id);
      fetch(`${contextInfo.verificationUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(verification),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      // TODO: handle fetch errors
    }
    finally {
      server.update(oldHost);
    }
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
