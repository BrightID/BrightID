import React from "react";
import { TextInput, StyleSheet, Text, View } from "react-native";

export default class SearchConnections extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<TextInput
					value={this.props.searchParam}
					onChangeText={value => this.props.updateParam(value)}
					style={styles.searchField}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		marginTop: 11,
		marginBottom: 11,
		width: "80%"
	},
	searchField: {
		height: 40,
		borderColor: "#ccc",
		borderWidth: 1,
		width: "80%"
	}
});
