/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-picker';
import nacl from 'tweetnacl';

class BrightID extends Component {
	componentDidMount() {
		const { publicKey, secretKey } = nacl.sign.keyPair();
		console.warn(publicKey);
		console.warn(secretKey);
		const options = {
			title: 'Select Avatar',
			customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
			storageOptions: {
				skipBackup: true,
				path: 'images',
			},
		};

		/**
		 * The first arg is the options object for customization (it can also be null or omitted for default options),
		 * The second arg is the callback which sends object: response (more info below in README)
		 */
		ImagePicker.showImagePicker(options, (response) => {
			console.log('Response = ', response);

			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			} else {
				let source = { uri: response.uri };

				// You can also display the image using data:
				// let source = { uri: 'data:image/jpeg;base64,' + response.data };

				this.setState({
					avatarSource: source,
				});
			}
		});
	}
	render() {
		return (
			<View style={styles.container}>
				<RNCamera
					ref={(ref) => {
						this.camera = ref;
					}}
					style={styles.preview}
					type={RNCamera.Constants.Type.back}
					flashMode={RNCamera.Constants.FlashMode.on}
					permissionDialogTitle={'Permission to use camera'}
					permissionDialogMessage={
						'We need your permission to use your camera phone'
					}
				/>
				<View
					style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}
				>
					<TouchableOpacity
						onPress={this.takePicture.bind(this)}
						style={styles.capture}
					>
						<Text style={{ fontSize: 14 }}> why then how </Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	takePicture = async function() {
		if (this.camera) {
			const options = { quality: 0.5, base64: true };
			const data = await this.camera.takePictureAsync(options);
			console.warn(data.uri);
		}
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: 'black',
	},
	preview: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	capture: {
		flex: 0,
		backgroundColor: '#fff',
		borderRadius: 5,
		padding: 15,
		paddingHorizontal: 20,
		alignSelf: 'center',
		margin: 20,
	},
});

export default BrightID;
