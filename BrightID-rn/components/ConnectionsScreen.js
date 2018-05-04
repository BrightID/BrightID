import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
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

	render() {
		return (
			<View style={styles.container}>
				<SearchConnections />
				{this.props.connections.map((props, index) => (
					<ConnectionCard key={index} {...props} />
				))}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "flex-start"
	}
});
