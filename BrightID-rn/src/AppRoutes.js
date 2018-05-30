import React from "react";
import HomeScreen from "./containers/HomeScreen";
import ConnectionsScreen from "./containers/ConnectionsScreen";
import Onboard from "./containers/Onboard";
import SignUp from "./containers/SignUp";
import AppBootstrap from "./AppBootstrap";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import LinearGradient from "react-native-linear-gradient";

const AppStack = createStackNavigator(
	{
		Home: {
			screen: HomeScreen
		},
		Connections: {
			screen: ConnectionsScreen
		}
	},
	{
		initialRouteName: "Home",
		navigationOptions: {
			title: "BrightID",
			headerBackground: (
				<LinearGradient
					colors={["#F52828", "#F76B1C"]}
					style={{ flex: 1, width: "100%" }}
				/>
			),
			headerTintColor: "#fff"
		}
	}
);

const OnboardingStack = createStackNavigator(
	{
		Onboard: {
			screen: Onboard
		},
		SignUp: {
			screen: SignUp
		}
	},
	{
		initialRouteName: "Onboard",
		navigationOptions: {
			title: "BrightID",
			headerTintColor: "#fff",
			headerTransparent: true,
			headerBackground: (
				<LinearGradient
					colors={["#F52828", "#F76B1C"]}
					style={{ flex: 1, width: "100%" }}
				/>
			)
		}
	}
);

export default createSwitchNavigator(
	{
		AppBootstrap: AppBootstrap,
		App: AppStack,
		Onboarding: OnboardingStack
	},
	{
		initialRouteName: "AppBootstrap"
	}
);
