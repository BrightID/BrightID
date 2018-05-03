// containers/WalletView.js
import { connect } from "react-redux";
import Home from "../components/Home";
import { setUpDefault } from "../actions/setUpDefault";

const mapStateToProps = state => {
	return {
		trustScore: state.main.get("trustScore"),
		name: state.main.get("name"),
		connections: state.main.get("connections"),
		groups: state.main.get("groups")
	};
};

const mapDispatchToProps = dispatch => {
	return {
		setUpDefault: () => {
			dispatch(setUpDefault());
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
