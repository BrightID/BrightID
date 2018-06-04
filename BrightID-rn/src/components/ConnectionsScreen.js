import React from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import PropTypes from "prop-types";

import SearchConnections from "../containers/SearchConnections";
import ConnectionCard from "../containers/ConnectionCard";

/**
 * Connection screen of BrightID
 */

export default class ConnectionsScreen extends React.Component {
	static propTypes = {
		connections: PropTypes.array
	};
	static navigationOptions = {
		title: "Connections"
	};
	_keyExtractor = item => item.firstName + item.lastName + item.id;
	render() {
		return (
			<View style={styles.container}>
				<SearchConnections />
				<FlatList
					style={styles.connectionsContainer}
					data={this.props.connections}
					keyExtractor={this._keyExtractor}
					renderItem={({ item }) => <ConnectionCard {...item} />}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fdfdfd",
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "flex-start"
	},
	connectionsContainer: {
		marginTop: 8,
		flex: 1
	}
});
