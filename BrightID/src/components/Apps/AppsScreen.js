// @flow

import * as React from 'react';
import { Linking, StyleSheet, View, FlatList } from 'react-native';
import { connect } from 'react-redux';
import ActionSheet from 'react-native-actionsheet';
import AppCard from './AppCard';
import { handleAppContext, deleteApp } from './model';
import EmptyList from '../EmptyList';

let deleteSheetRef = '';

type State = {
  selectedApp: string,
};

export class AppsScreen extends React.Component<Prop, State> {
  static navigationOptions = () => ({
    title: 'Apps',
    headerRight: () => <View />,
  });

  deleteSheetRef: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedApp: '',
    };
  }

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
    console.log('params', navigation.state.params);
    if (navigation.state.params) {
      handleAppContext(navigation.state.params);
    }
  };

  handleAction = (selectedApp: string) => () => {
    this.setState({ selectedApp }, () => {
      if (deleteSheetRef) deleteSheetRef.show();
    });
  };

  render() {
    const { selectedApp } = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.AppsList}
          data={this.props.apps}
          keyExtractor={({ name }, index) => name + index}
          renderItem={({ item }) => (
            <AppCard {...item} handleAction={this.handleAction} />
          )}
          ListEmptyComponent={
            <EmptyList
              title="No Apps."
              iconSize={46}
              iconType={"castle"}
              messageStyle={styles.message}
             />
          }
        />
        <ActionSheet
          ref={(o) => {
            deleteSheetRef = o;
          }}
          title={`Are you sure you want to delete ${selectedApp}`}
          options={['Delete', 'cancel']}
          cancelButtonIndex={1}
          onPress={(index) => {
            if (index === 0) {
              deleteApp(selectedApp);
            }
          }}
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
  message: {
    fontFamily: 'ApexNew-Medium',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ccc',
  },
});

export default connect((state) => ({ apps: state.apps.apps }))(AppsScreen);
