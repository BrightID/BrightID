import { connect } from "react-redux";
import ConnectionCard from "../components/ConnectionCard";
import { searchParam } from "../actions";

const mapStateToProps = state => {
	return {
		searchParam: state.main.get("searchParam")
	};
};

const mapDispatchToProps = dispatch => {
	return {
		updateParam: value => {
			dispatch(searchParam(value));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionCard);
