import React from "react";
import { Image, TextInput, StyleSheet, Text, View } from "react-native";
import PropTypes from "prop-types";
import Touchable from "react-native-platform-touchable";
import Ionicon from "react-native-vector-icons/Ionicons";
import moment from "moment";

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop trustScore
 * @prop connectionTime
 * @prop avatar
 */

export default class ConnectionCard extends React.Component {
	static propTypes = {
		firstName: PropTypes.string,
		lastName: PropTypes.string,
		avatar: PropTypes.string,
		trustScore: PropTypes.number
	};
	render() {
		return (
			<View style={styles.container}>
				<Image source={{ uri: this.props.avatar }} style={styles.avatar} />
				<View style={styles.info}>
					<Text style={styles.name}>
						{this.props.firstName} {this.props.lastName}
					</Text>
					<Text style={styles.trustScore}>
						{this.props.trustScore}% Trusted
					</Text>
					<Text>Connected {moment(this.props.connectionDate).fromNow()}</Text>
				</View>
				<Touchable onPress={this.focus} style={styles.searchIcon}>
					<Ionicon size={48} name="ios-more" color="#ccc" />
				</Touchable>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-evenly",
		backgroundColor: "#fff",
		height: 110,
		marginTop: 22,
		shadowColor: "#ccc",
		shadowOffset: { width: 0, height: 7 },
		shadowOpacity: 0.3,
		shadowRadius: 4
	},
	avatar: {
		borderRadius: 25,
		width: 50,
		height: 50
	},
	info: {
		width: "50%"
	},
	name: {
		fontSize: 22
	},
	trustScore: {
		color: "green",
		fontWeight: "100"
	}
});
