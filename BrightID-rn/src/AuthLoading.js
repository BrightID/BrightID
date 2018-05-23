// @flow
import React from "react";
import {
	ActivityIndicator,
	AsyncStorage,
	StatusBar,
	StyleSheet,
	View
} from "react-native";
import store from "./store";
import { setUpDefault } from "./actions/setUpDefault";

export default class AuthLoadingScreen extends React.Component {
	constructor(props) {
		super(props);
		this._bootstrapAsync();
	}

	// Fetch the token from storage then navigate to our appropriate place
	_bootstrapAsync = async () => {
		// bootstrap the application
		// user token determines whether or not to load onboarding HomeScreen
		// setUpDefault will call the getUserData action located in actions/storage
		// fake connections data is loaded into the store
		// this will navigate to either the Auth or App stack
		try {
			let userData = await AsyncStorage.getItem("userData");
			if (userData !== null) {
				userData = JSON.parse(userData);
				store.dispatch(setUpDefault(userData));
			} else {
				store.dispatch(setUpDefault({}));
			}
			this.props.navigation.navigate(userData ? "App" : "Auth");
		} catch (err) {
			console.warn(err);
		}
	};

	// Render any loading content that you like here
	render() {
		return (
			<View style={styles.container}>
				<ActivityIndicator />
				<StatusBar barStyle="default" />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});
