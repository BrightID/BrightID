import React from "react";
import { Provider } from "react-redux";
import { StyleSheet, Text, View } from "react-native";
import RootStack from "./RootStack";
import store from "./store";
import { setUpDefault } from "./actions/setUpDefault";

/**
 * Central part of the application
 * react-navigation is used for routing
 * read docs here: https://reactnavigation.org/
 * RootStack.js contains all of the Routes
 * Redux / Immutable are used for managing state
 * read docs here: https://facebook.github.io/immutable-js/
 */

export default class App extends React.Component {
	componentWillMount() {
		// initialize the state of the application with dummy data
		store.dispatch(setUpDefault());
	}
	render() {
		return (
			<Provider store={store}>
				<View style={styles.container}>
					<RootStack />
				</View>
			</Provider>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});
