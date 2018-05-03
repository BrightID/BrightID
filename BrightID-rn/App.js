import React from "react";
import { Provider } from "react-redux";
import { StyleSheet, Text, View } from "react-native";
import Home from "./containers/Home";
import store from "./store";

export default class App extends React.Component {
	render() {
		return (
			<Provider store={store}>
				<View style={styles.container}>
					<Home />
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
