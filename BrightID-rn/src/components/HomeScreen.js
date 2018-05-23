import React from "react";
import {
	Alert,
	AsyncStorage,
	Button,
	StyleSheet,
	Text,
	View
} from "react-native";
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
												navigation.navigate("Auth");
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
					<View style={styles.counts}>
						<View style={styles.countsGroup}>
							<Text style={styles.countsText}>
								{this.props.connectionsCount}
							</Text>
							<Text style={styles.countsText}>Connections</Text>
						</View>
						<View style={styles.countsGroup}>
							<Text style={styles.countsText}>{this.props.groupsCount}</Text>
							<Text style={styles.countsText}>Groups</Text>
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
		fontSize: 33,
		fontWeight: "300",
		marginTop: 7,
		textAlign: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.4,
		shadowRadius: 1.9
	},
	user: {
		marginTop: 20,
		marginBottom: 18
	},
	trustScoreContainer: {
		borderBottomColor: "#333",
		borderTopColor: "#333",
		borderTopWidth: StyleSheet.hairlineWidth,
		borderBottomWidth: StyleSheet.hairlineWidth,
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
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#ccc",
		height: 200
	},
	connectText: {
		fontSize: 12
	}
});
