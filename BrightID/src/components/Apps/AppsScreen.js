// @flow

import * as React from 'react';
import { Linking, StyleSheet, View, FlatList } from 'react-native';
import { connect } from 'react-redux';
import AppCard from './AppCard';
import { handleAppContext } from './model';

export class AppsScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Apps',
    headerRight: () => <View />,
  });

  componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('willFocus', async () => {
      this.handleDeepLink();
      Linking.addEventListener('url', this.handleDeepLink);
    });
    navigation.addListener('willBlur', async () => {
      Linking.removeEventListener('url', this.handleDeepLink);
    });
  }

  handleDeepLink = (e) => {
    const { navigation } = this.props;
    if (navigation.state.params) {
      handleAppContext(navigation.state.params);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.AppsList}
          data={this.props.apps}
          keyExtractor={({ name }, index) => name + index}
          renderItem={({ item }) => <AppCard {...item} />}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  AppsList: {
    flex: 1,
  },
});

export default connect((state) => state)(AppsScreen);
