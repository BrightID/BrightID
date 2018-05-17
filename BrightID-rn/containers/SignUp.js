import { connect } from "react-redux";
import SignUp from "../components/SignUp";
import { setUpDefault } from "../actions/setUpDefault";

const mapStateToProps = state => {
	return {
		trustScore: state.main.get("trustScore"),
		name: state.main.get("name"),
		connectionsCount: state.main.get("connectionsCount"),
		groupsCount: state.main.get("groupsCount")
	};
};

const mapDispatchToProps = dispatch => {
	return {
		setUpDefault: () => {
			dispatch(setUpDefault());
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
