import React from "react";
import {
	AsyncStorage,
	Button,
	CameraRoll,
	Image,
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
import ImagePicker from "react-native-image-picker";
import UserAvatar from "./UserAvatar";
import USER_DATA from '../actions/storage';

/**
 * Home screen of BrightID
 */

export default class HomeScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			nameornym: "",
			active: false,
			avatarUri: ""
		};
		// this.handleBrightIdCreation = this.handleBrightIdCreation.bind(this);
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

	getAvatarPhoto = () => {

		// for full documentation on the Image Picker api
		// see https://github.com/react-community/react-native-image-picker

		const options = {
			title: "Select Avatar",
			storageOptions: {
				skipBackup: true,
				path: "images"
			}
		};

		ImagePicker.showImagePicker(options, response => {
			console.log("Response = ", response);

			if (response.didCancel) {
				console.log("User cancelled image picker");
			} else if (response.error) {
				console.log("ImagePicker Error: ", response.error);
			} else if (response.customButton) {
				console.log("User tapped custom button: ", response.customButton);
			} else {
				const { uri } = response;

				// You can also display the image using data:
				// let source = { uri: 'data:image/jpeg;base64,' + response.data };

				this.setState({
					avatarUri: uri
				});
				console.warn(uri);
			}
		});
	};

	handleBrightIdCreation = async () => {
		const { avatarUri, nameornym } = this.state;
		if (avatarUri && nameornym) {
			const saveData = JSON.stringify({ avatarUri, nameornym });
			await AsyncStorage.setItem(USER_DATA, saveData););
			this.props.navigation.navigate("App");
		} else if (!avatarUri) {
			alert("please upload a photo so I can see your face");
		} else if (!nameornym) {
			alert("please add your name or nym so I know who you are");
		}
	};

	render() {
		const { avatarUri } = this.state;
		const addPhotoButton = (
			<TouchableOpacity onPress={this.getAvatarPhoto} style={styles.addPhoto}>
				<Text style={styles.addPhotoText}>Add Photo</Text>
				<Feather size={35} name="camera" color="#979797" />
			</TouchableOpacity>
		);

		return (
			<View style={styles.container}>
				<View
					style={this.state.active ? styles.hidden : styles.addPhotoContainer}
				>
					{avatarUri ? (
						<Image style={styles.avatar} source={{ uri: avatarUri }} />
					) : (
						addPhotoButton
					)}
				</View>
				<View style={styles.textInputContainer}>
					<Text style={styles.midText}>What do your friends know you by?</Text>
					<TextInput
						onChangeText={nameornym => this.setState({ nameornym })}
						value={this.state.nameornym}
						placeholder="Name or Nym"
						placeholderTextColor="#9e9e9e"
						style={styles.textInput}
						onFocus={() => this.setState({ active: true })}
						onBlur={() => this.setState({ active: false })}
						onEndEditing={() => this.setState({ active: false })}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Text style={styles.buttonInfoText}>
						Your name and photo will never be shared with apps or stored on
						servers
					</Text>
					<TouchableOpacity
						style={styles.createBrightIdButton}
						onPress={this.handleBrightIdCreation}
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
	hidden: {
		display: "none"
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
	},
	avatar: {
		width: 160,
		height: 160,
		borderRadius: 80,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.8,
		shadowRadius: 2
	}
});
