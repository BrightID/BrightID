import React from "react";
import { Alert, AsyncStorage, StyleSheet, Text, View } from "react-native";
import PropTypes from "prop-types";
import HeaderButtons from "react-navigation-header-buttons";
import Ionicons from "react-native-vector-icons/Ionicons";
import BottomNav from "./BottomNav";
import UserAvatar from "../containers/UserAvatar";
import store from "../store";
import { removeUserData } from "../actions";

/**
 * Home screen of BrightID
 */

export default class HomeScreen extends React.Component {
	static propTypes = {
		trustScore: PropTypes.string,
		connectionsCount: PropTypes.number,
		groupsCount: PropTypes.number,
		name: PropTypes.string
	};

	static navigationOptions = ({ navigation }) => {
		return {
			title: "BrightID",
			headerBackTitle: "Home",
			headerRight: (
				<HeaderButtons IconComponent={Ionicons} iconSize={32} color="#fff">
					<HeaderButtons.Item
						title="more"
						iconName="ios-more-outline"
						onPress={async () => {
							Alert.alert(
								"WARNING",
								"Would you like to delete user data and return to the onboarding screen?",
								[
									{
										text: "Cancel",
										onPress: () => console.log("Cancel Pressed"),
										style: "cancel"
									},
									{
										text: "Sure",
										onPress: async () => {
											try {
												navigation.navigate("Onboarding");
												await AsyncStorage.flushGetRequests();
												await AsyncStorage.removeItem("userData");
												store.dispatch(removeUserData());
											} catch (err) {
												console.warn(err);
											}
										}
									}
								],
								{ cancelable: true }
							);
						}}
					/>
				</HeaderButtons>
			),
			headerLeft: (
				<HeaderButtons
					IconComponent={Ionicons}
					iconSize={32}
					color="#fff"
					left={true}
				>
					<HeaderButtons.Item
						title="help"
						iconName="ios-help-circle-outline"
						onPress={() => console.log("help")}
					/>
				</HeaderButtons>
			)
		};
	};

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.main}>
					<View style={styles.user}>
						<UserAvatar />
						<Text style={styles.name}>{this.props.name}</Text>
					</View>
					<View style={styles.trustScoreContainer}>
						<Text style={styles.trustScore}>
							{this.props.trustScore}% Trusted
						</Text>
					</View>
					<View style={styles.countsContainer}>
						<View style={styles.countsGroup}>
							<Text style={styles.countsNumberText}>
								{this.props.connectionsCount}
							</Text>
							<Text style={styles.countsDescriptionText}>Connections</Text>
						</View>
						<View style={styles.countsGroup}>
							<Text style={styles.countsNumberText}>
								{this.props.groupsCount}
							</Text>
							<Text style={styles.countsDescriptionText}>Groups</Text>
						</View>
					</View>
					<View style={styles.connectContainer}>
						<Text style={styles.connectText}>CONNECT</Text>
					</View>
				</View>
				<BottomNav {...this.props} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff"
		// alignItems: "center",
		// flexDirection: "column",
		// justifyContent: "space-between"
	},
	main: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "space-between"
	},
	name: {
		fontFamily: "ApexNew-Book",
		fontSize: 30,
		marginTop: 8,
		textAlign: "center",
		shadowColor: "rgba(0,0,0,0.32)",
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4
	},
	user: {
		marginTop: 24
	},
	trustScoreContainer: {
		borderBottomColor: "#e3e1e1",
		borderTopColor: "#e3e1e1",
		borderTopWidth: 1,
		borderBottomWidth: 1,
		width: "80%",
		marginTop: 9,
		paddingTop: 7,
		paddingBottom: 7
	},
	trustScore: {
		fontFamily: "ApexNew-Book",
		fontSize: 18,
		textAlign: "center",
		color: "green"
	},
	countsContainer: {
		justifyContent: "space-evenly",
		flexDirection: "row",
		width: "80%",
		marginTop: 12
	},
	countsDescriptionText: {
		fontFamily: "ApexNew-Book",
		textAlign: "center",
		fontSize: 16
	},
	countsNumberText: {
		fontFamily: "ApexNew-Book",
		textAlign: "center",
		fontSize: 22
	},
	connectContainer: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#ccc",
		flex: 1,
		marginTop: 17
	},
	connectText: {
		fontFamily: "ApexNew-Book",
		fontSize: 16
	}
});
