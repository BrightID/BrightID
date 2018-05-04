import Home from './containers/Home';
import { StackNavigator } from 'react-navigation';

const RootStack = StackNavigator(
  {
    Home: {
      screen: Home,
    },
    Details: {
      screen: Home,
    },
  },
  {
    initialRouteName: 'Home',
		navigationOptions: {
			title: 'BrightID',
      headerStyle: {
        backgroundColor: '#f48b1e',
      },
      headerTintColor: '#fff',
		}
  }
);

export default RootStack;
