import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BrightId from './src/App';
export default class App extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<BrightId />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
