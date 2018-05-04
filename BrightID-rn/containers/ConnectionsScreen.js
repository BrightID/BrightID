import { connect } from "react-redux";
import ConnectionsScreen from "../components/ConnectionsScreen";
import { setUpDefault } from "../actions/setUpDefault";

const mapStateToProps = state => {
	return {
		connections: [
			{ name: "friend1" },
			{ name: "friend3" },
			{ name: "friend2" },
			{ name: "friend4" }
		]
	};
};

const mapDispatchToProps = dispatch => {
	return {
		setUpDefault: () => {
			dispatch(setUpDefault());
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionsScreen);
