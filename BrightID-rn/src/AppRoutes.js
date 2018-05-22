import HomeScreen from "./containers/HomeScreen";
import ConnectionsScreen from "./containers/ConnectionsScreen";
import Onboard from "./containers/Onboard";
import SignUp from "./containers/SignUp";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";

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
			headerStyle: {
				backgroundColor: "#f48b1e"
			},
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
			headerStyle: {
				backgroundColor: "#f48b1e"
			},
			headerTintColor: "#fff"
		}
	}
);

export default createSwitchNavigator(
	{
		// AuthLoading: AuthLoadingScreen,
		App: AppStack,
		Auth: OnboardingStack
	},
	{
		initialRouteName: "Auth"
	}
);
