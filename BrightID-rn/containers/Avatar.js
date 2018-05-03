// containers/WalletView.js
import { connect } from "react-redux";
import Avatar from "../components/Avatar";

const mapStateToProps = state => {
	return {
		avatar: state.main.get("avatar")
	};
};

export default connect(mapStateToProps, null)(Avatar);
