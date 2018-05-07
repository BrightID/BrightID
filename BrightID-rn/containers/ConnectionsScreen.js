import { connect } from "react-redux";
import ConnectionsScreen from "../components/ConnectionsScreen";
import { setUpDefault } from "../actions/setUpDefault";

// filter connections
// currently comparing searchParam with item name in list
// data is santitized into lower case, and white space is removed
// prior to comparing the strings with the data array

const mapStateToProps = state => {
	const searchParam = state.main.get("searchParam");
	return {
		connections: state.main
			.get("allConnections")
			.filter(item =>
				item
					.get("name")
					.toLowerCase()
					.replace(/\s/g, "")
					.includes(searchParam.toLowerCase().replace(/\s/g, ""))
			)
			.toJS()
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
