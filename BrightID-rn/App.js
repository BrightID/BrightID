import React from "react";
import { Provider } from "react-redux";
import { StyleSheet, Text, View } from "react-native";
import RootStack from "./RootStack";
import store from "./store";
import { setUpDefault } from "./actions/setUpDefault";

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
