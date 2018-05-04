import HomeScreen from "./containers/HomeScreen";
import ConnectionsScreen from "./containers/ConnectionsScreen";
import { StackNavigator } from "react-navigation";

const RootStack = StackNavigator(
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

export default RootStack;
