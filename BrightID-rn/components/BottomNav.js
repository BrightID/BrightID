import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Touchable from "react-native-platform-touchable";
import Ionicon from "react-native-vector-icons/Ionicons";

/**
 * list of icons which will navigate between screens inside the app
 * navigate between screens using the react-navigation
 * @prop navigation.navigate accepts param for linking to another screen
 * see RootStack.js for list of screens / routes in the app
 */

export default class BottomNav extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<Touchable onPress={() => this.props.navigation.navigate("Home")}>
					<View style={styles.navIconContainer}>
						<Ionicon size={32} name="ios-home-outline" color="#000" />
						<Text>Home</Text>
					</View>
				</Touchable>
				<Touchable
					onPress={() => this.props.navigation.navigate("Connections")}
				>
					<View style={styles.navIconContainer}>
						<Ionicon
							size={32}
							name="ios-git-pull-request-outline"
							color="#000"
						/>
						<Text>Connections</Text>
					</View>
				</Touchable>
				<Touchable onPress={() => console.log("Groups")}>
					<View style={styles.navIconContainer}>
						<Ionicon size={32} name="ios-contacts-outline" color="#000" />
						<Text>Groups</Text>
					</View>
				</Touchable>
				<Touchable onPress={() => console.log("Notifications")}>
					<View style={styles.navIconContainer}>
						<Ionicon size={32} name="ios-notifications-outline" color="#000" />
						<Text>Notifications</Text>
					</View>
				</Touchable>
				<Touchable onPress={() => console.log("Apps")}>
					<View style={styles.navIconContainer}>
						<Ionicon size={32} name="ios-apps-outline" color="#000" />
						<Text>Apps</Text>
					</View>
				</Touchable>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		height: 84,
		backgroundColor: "#fff",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-evenly",
		width: "100%",
		marginBottom: 3
	},
	navIconContainer: {
		flexDirection: "column",
		alignItems: "center"
	}
});
