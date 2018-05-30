import { connect } from "react-redux";
import UserAvatar from "../components/UserAvatar";

const mapStateToProps = state => {
	return {
		userAvatar: state.main.get("userAvatar"),
		ronPaul: state.main.get("ronPaul")
	};
};

export default connect(mapStateToProps, null)(UserAvatar);
