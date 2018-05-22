import { connect } from "react-redux";
import SignUp from "../components/SignUp";
import { saveUserData } from "../actions/storage";

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
		saveUserData: async userData => {
			dispatch(await saveUserData(userData));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
