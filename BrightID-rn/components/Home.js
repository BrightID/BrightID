import React from "react";
import { StyleSheet, Text, View } from "react-native";
import TopNavBar from "../containers/TopNavBar";
import BottomNav from "../containers/BottomNav";
import Avatar from "../containers/Avatar";

export default class App extends React.Component {
	componentWillMount() {
		// initializes the state of the application
		// TODO  move this up into the app or a higher component
		// initialize the state of the application with dummy data
		this.props.setUpDefault();
	}
	render() {
		return (
			<View style={styles.container}>
				<TopNavBar />
				<View style={styles.user}>
					<Avatar />
					<Text style={styles.name}>{this.props.name}</Text>
				</View>
				<View style={styles.trustScoreContainer}>
					<Text style={styles.trustScore}>
						{this.props.trustScore}% Trusted
					</Text>
				</View>
				<View style={styles.counts}>
					<View style={styles.countsGroup}>
						<Text style={styles.countsText}>{this.props.connections}</Text>
						<Text style={styles.countsText}>Connections</Text>
					</View>
					<View style={styles.countsGroup}>
						<Text style={styles.countsText}>{this.props.groups}</Text>
						<Text style={styles.countsText}>Groups</Text>
					</View>
				</View>
				<View style={styles.connectContainer}>
					<Text style={styles.connectText}>CONNECT</Text>
				</View>
				<BottomNav />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center"
		// justifyContent: "center"
	},
	name: {
		fontSize: 33,
		fontWeight: "bold",
		marginTop: 7,
		textAlign: "center"
	},
	user: {
		marginTop: 20,
		marginBottom: 18
	},
	trustScoreContainer: {
		borderBottomColor: "#333",
		borderTopColor: "#333",
		borderTopWidth: 1,
		borderBottomWidth: 1,
		width: "80%",
		paddingTop: 7,
		paddingBottom: 7
	},
	trustScore: {
		textAlign: "center",
		color: "green",
		fontSize: 18
	},
	counts: {
		justifyContent: "space-evenly",
		flexDirection: "row",
		width: "80%",
		paddingTop: 16,
		paddingBottom: 16
	},
	countsText: {
		textAlign: "center",
		fontSize: 18
	},
	connectContainer: {
		width: "90%",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#ccc",
		height: 200
	},
	connectText: {
		fontSize: 12
	}
});
