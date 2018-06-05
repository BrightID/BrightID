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
import { setupPPKeys, generatePPKeys } from "./store/index";

export default class AppBootstrap extends React.Component {
	constructor(props) {
		super(props);
		this._bootstrapAsync();
	}

	// Fetch the token from storage then navigate to our appropriate place
	_bootstrapAsync = async () => {
		// bootstrap the application
		// async storage key 'userData' : {
		//	userToken: String,
		//  nameornym: String,
		//  avatarUri: String
		//	}
		try {
			let userData = await AsyncStorage.getItem("userData");
			if (userData !== null) {
				userData = JSON.parse(userData);
				store.dispatch(setUpDefault(userData));
			} else {
				store.dispatch(setUpDefault({}));
			}
			this.props.navigation.navigate(userData ? "App" : "Onboarding");
		} catch (err) {
			console.warn(err);
		}

		//This should check the async storage for the Public/private keys as well. If they don't exist, it generates
		//new ones using tweetnacl.js.

		try{
			//Should use some kind of encrypted storage
			let ppKeys = await AsyncStorage.getItem("ppKeys")

			if(ppKeys !== null){
				ppKeys = JSON.parse(ppKeys);
				store.dispatch(setupPPKeys(ppKeys));
			} else {

				//Generate new PPKeys and exchange with server.
				store.dispatch(generatePPKeys({}))
			}

		}catch (err) {
			console.error(err);
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
