import React from "react";
import {
	Button,
	StyleSheet,
	Image,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import PropTypes from "prop-types";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaintainPrivacy from "./onboardingScreens/MaintainPrivacy";
import Carousel, { Pagination } from "react-native-snap-carousel";

/**
 * Home screen of BrightID
 */

export default class Onboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			entries: [
				<MaintainPrivacy />,
				<MaintainPrivacy />,
				<MaintainPrivacy />,
				<MaintainPrivacy />
			],
			activeSlide: 0
		};
	}

	static navigationOptions = {
		title: "",
		headerStyle: {
			height: 0
		}
	};

	_renderItem({ item, index }) {
		return <View style={styles.onboardingScreens}>{item}</View>;
	}

	pagination() {
		const { entries, activeSlide } = this.state;
		return (
			<Pagination
				dotsLength={entries.length}
				activeDotIndex={activeSlide}
				containerStyle={styles.pagination}
				dotStyle={{
					width: 7,
					height: 7,
					borderRadius: 3.5,
					marginHorizontal: 8,
					backgroundColor: "#333"
				}}
				inactiveDotStyle={
					{
						// Define styles for inactive dots here
					}
				}
				inactiveDotOpacity={0.4}
				inactiveDotScale={1}
			/>
		);
	}
	render() {
		return (
			<View style={styles.container}>
				<View style={{ height: 471 }}>
					<Carousel
						data={this.state.entries}
						renderItem={this._renderItem}
						layout={"default"}
						sliderWidth={340}
						itemWidth={340}
						onSnapToItem={index => this.setState({ activeSlide: index })}
					/>
				</View>
				<View style={{ flex: 1 }}>{this.pagination()}</View>
				<View style={{ flex: 1 }}>
					<TouchableOpacity
						onPress={() => this.props.navigation.navigate("SignUp")}
						style={styles.button}
					>
						<Text style={styles.buttonText}>Get Started</Text>
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
	onboardingScreens: {
		height: 476,
		// borderWidth: StyleSheet.hairlineWidth,
		// borderColor: "#5497E8",
		width: "100%"
	},
	pagination: {
		flex: 1,
		// borderWidth: StyleSheet.hairlineWidth,
		// borderColor: "#5497E8",
		// flex: 1,
		// marginTop: -400,
		alignSelf: "center"
	},
	button: {
		// borderWidth: StyleSheet.hairlineWidth,
		borderWidth: 1,
		borderColor: "#5497E8",
		paddingTop: 12,
		paddingBottom: 12,
		width: 290,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
		marginBottom: 10
	},
	buttonText: {
		color: "#5497E8",
		fontSize: 17,
		fontWeight: "bold"
	}
});
