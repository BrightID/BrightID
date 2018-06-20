// @flow

import * as React from 'react';
import {
	AsyncStorage,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { ImagePicker, Permissions } from 'expo';
// import ImagePicker from 'react-native-image-picker';
import { connect } from 'react-redux';
import HeaderButtons from 'react-navigation-header-buttons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { saveDataSuccess } from '../actions';

type Props = {
	dispatch: Function,
	navigation: { navigate: Function },
};

type State = {
	nameornym: string,
	active: boolean,
	avatarUri: string,
};

class SignUp extends React.Component<Props, State> {
	static navigationOptions = {
		title: 'BrightID',
		headerBackTitle: 'SignUp',
		headerStyle: {
			backgroundColor: '#f48b1e',
		},
		headerRight: (
			<HeaderButtons IconComponent={Ionicons} iconSize={32} color="#fff">
				<HeaderButtons.Item
					title="help"
					iconName="ios-help-circle-outline"
					onPress={() => console.log('help')}
				/>
			</HeaderButtons>
		),
	};

	constructor(props) {
		super(props);
		this.state = {
			nameornym: '',
			active: false,
			avatarUri: '',
		};
		// this.handleBrightIdCreation = this.handleBrightIdCreation.bind(this);
	}

	static getDerivedStateFromProps(nextProps) {
		// this is an indirect way to listen for actions
		// when saveDataSuccess is dispatched, the state of the app will
		// add a userToken into the redux store
		// thats how we will know data has been saved successfully and we can
		// navigate out of the onboarding flow
		if (nextProps.userToken) {
			nextProps.navigation.navigate('App');
		}
		return null;
	}
	// async componentDidMount() {
	// 	await Permissions.getAsync(Permissions.CAMERA_ROLL);
	// }
	getAvatarPhoto = async () => {
		// expo version
		try {
			let result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: 'Images',
				base64: true,
			});

			if (!result.cancelled) {
				this.setState({ avatarUri: result.uri });
			}
		} catch (err) {
			console.warn(err);
		}

		// for full documentation on the Image Picker api
		// see https://github.com/react-community/react-native-image-picker

		// const options = {
		//   title: 'Select Avatar',
		//   mediaType: 'photo',
		//   storageOptions: {
		//     skipBackup: false,
		//     path: 'images',
		//   },
		//   customButtons: [{ name: 'defaultAvatar', title: 'Use Default Avatar' }],
		//   noData: true,
		//   allowsEditing: true,
		// };

		// ImagePicker.showImagePicker(options, (response) => {
		//   console.log('Response = ', response);

		//   if (response.didCancel) {
		//     console.warn('User cancelled image picker');
		//   } else if (response.error) {
		//     console.warn('ImagePicker Error: ', response.error);
		//   } else if (response.customButton === 'defaultAvatar') {
		//     this.setState({
		//       avatarUri: 'https://commons.wikimedia.org/wiki/File:PICA.jpg',
		//     });
		//     console.warn('User tapped custom button: ', response.customButton);
		//   } else {
		//     const { uri } = response;

		//     // You can also display the image using data:
		//     // let source = { uri: 'data:image/jpeg;base64,' + response.data };

		//     this.setState({
		//       avatarUri: uri,
		//     });
		//   }
		// });
	};

	handleBrightIdCreation = async () => {
		try {
			const { avatarUri, nameornym } = this.state;
			// saveUserData is located in actions/storage.js
			// it contains three asynchrous function calls, updating async storage
			// the order of parameters are important for now
			// if (!avatarUri) {
			// 	return alert('Please Upload a picture!');
			// } else if (!nameornym) {
			// 	return alert('Please add your name or nym');
			// }

			if (!nameornym) {
				return alert('Please add your name or nym');
			}

			const userData = {
				userToken: 'user_token',
				nameornym,
				avatarUri,
			};

			// save avatar photo uri and name in async storage

			await AsyncStorage.setItem('userData', JSON.stringify(userData));

			// update redux store
			this.props.dispatch(saveDataSuccess(userData));
			// navigate to home page
			this.props.navigation.navigate('App');
		} catch (err) {
			console.warn(err);
		}
	};

	render() {
		const { avatarUri } = this.state;

		const addPhotoButton = (
			<TouchableOpacity onPress={this.getAvatarPhoto} style={styles.addPhoto}>
				<Text style={styles.addPhotoText}>Add Photo</Text>
				<Ionicons size={48} name="ios-camera-outline" color="#979797" />
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
		backgroundColor: '#fff',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'flex-start',
	},
	addPhotoContainer: {
		height: 320,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 54,
		// borderWidth: 1
	},
	textInputContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		// borderWidth: 1
	},
	buttonContainer: {
		flex: 1,
		justifyContent: 'space-evenly',
		alignItems: 'center',
		// borderWidth: 1
	},
	addPhoto: {
		// borderWidth: StyleSheet.hairlineWidth,
		borderWidth: 1,
		borderColor: '#979797',
		height: 183,
		width: 183,
		borderRadius: 91.5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	hidden: {
		display: 'none',
	},
	addPhotoText: {
		fontFamily: 'ApexNew-Book',
		color: '#979797',
		marginBottom: 11,
		marginTop: 11,
		fontSize: 18,
	},

	midText: {
		fontFamily: 'ApexNew-Book',
		fontSize: 18,
	},
	textInput: {
		fontFamily: 'ApexNew-Light',
		fontSize: 36,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#9e9e9e',
		marginTop: 22,
		width: 275,
		textAlign: 'center',
		paddingBottom: 5,
		// lineHeight: 35
	},
	buttonInfoText: {
		fontFamily: 'ApexNew-Book',
		color: '#9e9e9e',
		fontSize: 14,
		width: 298,
		textAlign: 'center',
	},
	createBrightIdButton: {
		backgroundColor: '#428BE5',
		width: 300,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 13,
		paddingBottom: 12,
	},
	buttonInnerText: {
		fontFamily: 'ApexNew-Medium',
		color: '#fff',
		fontWeight: '600',
		fontSize: 18,
	},
	avatar: {
		width: 160,
		height: 160,
		borderRadius: 80,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.8,
		shadowRadius: 2,
	},
});

export default connect(null)(SignUp);
