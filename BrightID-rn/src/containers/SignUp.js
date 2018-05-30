import { connect } from "react-redux";
import SignUp from "../components/SignUp";
import { saveUserData } from "../actions/storage";

const mapStateToProps = state => {
	return {
		userToken: state.main.get("userToken")
	};
};

const mapDispatchToProps = dispatch => {
	return {
		saveUserData: (nameornym: String, avatarUri: String) => {
			dispatch(saveUserData(nameornym, avatarUri));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
