import React from "react";
import {
	Button,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import PropTypes from "prop-types";
import HeaderButtons from "react-navigation-header-buttons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import BottomNav from "./BottomNav";
import UserAvatar from "../containers/UserAvatar";

/**
 * Home screen of BrightID
 */

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: ""
		};
	}

	static navigationOptions = {
		title: "BrightID",
		headerBackTitle: "SignUp",
		headerStyle: {
			backgroundColor: "#f48b1e"
		},
		headerRight: (
			<HeaderButtons IconComponent={Ionicons} iconSize={32} color="#fff">
				<HeaderButtons.Item
					title="help"
					iconName="ios-help-circle-outline"
					onPress={() => console.log("help")}
				/>
			</HeaderButtons>
		)
	};

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.addPhotoContainer}>
					<TouchableOpacity style={styles.addPhoto}>
						<Text style={styles.addPhotoText}>Add Photo</Text>
						<Feather size={35} name="camera" color="#979797" />
					</TouchableOpacity>
				</View>
				<View style={styles.textInputContainer}>
					<Text style={styles.midText}>What do your friends know you by?</Text>
					<TextInput
						onChangeText={name => this.setState({ name })}
						value={this.state.name}
						placeholder="Name or Nym"
						placeholderTextColor="#9e9e9e"
						style={styles.textInput}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Text style={styles.buttonInfoText}>
						Your name and photo will never be shared with apps or stored on
						servers
					</Text>
					<TouchableOpacity
						style={styles.createBrightIdButton}
						onPress={() => alert("derbiggy")}
					>
						<Text style={styles.buttonInnerText}>Create My BrightID</Text>
					</TouchableOpacity>
				</View>
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
	},
	addPhotoContainer: {
		height: 320,
		alignItems: "center",
		justifyContent: "center"
		// borderWidth: 1
	},
	textInputContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
		// borderWidth: 1
	},
	buttonContainer: {
		flex: 1,
		justifyContent: "space-evenly",
		alignItems: "center"
		// borderWidth: 1
	},
	addPhoto: {
		// borderWidth: StyleSheet.hairlineWidth,
		borderWidth: 1,
		borderColor: "#979797",
		height: 160,
		width: 160,
		borderRadius: 80,
		justifyContent: "center",
		alignItems: "center"
	},
	addPhotoText: {
		color: "#979797",
		marginBottom: 11,
		marginTop: 11,
		fontSize: 18
	},

	midText: {
		fontSize: 16,
		fontWeight: "100"
	},
	textInput: {
		fontSize: 28,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#9e9e9e",
		fontWeight: "100",
		marginTop: 22,
		width: 275,
		textAlign: "center",
		paddingBottom: 5
		// lineHeight: 35
	},
	buttonInfoText: {
		fontWeight: "100",
		color: "#9e9e9e",
		width: 298,
		textAlign: "center"
	},
	createBrightIdButton: {
		backgroundColor: "#428BE5",
		width: 298,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 12,
		paddingBottom: 12
	},
	buttonInnerText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16
	}
});
