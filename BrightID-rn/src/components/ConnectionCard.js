import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
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
		trustScore: PropTypes.number,
		connectionDate: PropTypes.string
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
					<Text style={styles.connectedText}>
						Connected {moment(this.props.connectionDate).fromNow()}
					</Text>
				</View>
				<Touchable onPress={this.focus} style={styles.moreIcon}>
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
		height: 94,
		marginBottom: 11.8,
		shadowColor: "rgba(0,0,0,0.32)",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.43,
		shadowRadius: 4
	},
	avatar: {
		borderRadius: 30,
		width: 60,
		height: 60,
		marginLeft: 14
	},
	info: {
		marginLeft: 25,
		flex: 1,
		height: 71,
		flexDirection: "column",
		justifyContent: "space-evenly"
		// width: "50%"
	},
	name: {
		fontFamily: "ApexNew-Book",
		fontSize: 20,
		shadowColor: "rgba(0,0,0,0.32)",
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4
	},
	trustScore: {
		fontFamily: "ApexNew-Medium",
		fontSize: 14,
		color: "green"
	},
	conectedText: {
		fontFamily: "ApexNew-Book",
		fontSize: 14
	},
	moreIcon: {
		marginRight: 16
	}
});
