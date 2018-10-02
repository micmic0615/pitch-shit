import React, { Component, Fragment } from 'react';
import FingerPlacement from "Home/modules/FingerPlacement/"
import FingerDexterity from "Home/modules/FingerDexterity/"

import './style.scss';

class Home extends Component {
	constructor(props){
		super(props)

		this.state = {
			module: ""
		}
	}

	componentDidMount = ()=>{
		this.hashRouter(this.props.location)
	}

	componentWillReceiveProps = (props)=>{
		if (this.props.location.hash != props.location.hash){
			this.hashRouter(props.location)
		}
	}

	hashRouter = (location)=>{
		let module_to_load = "";
		switch (location.hash){
			case "#finger_dexterity":
				module_to_load = <FingerDexterity {...this.props} />;
				break;

			default: 
				module_to_load = <FingerPlacement {...this.props} />;
				break;
		}

		this.setState({module: module_to_load})
	}

	render(){
		return <Fragment>
			{this.state.module}
			<div className="bottom_menu">
				<a href="#" className="button">
					Finger Placement
				</a>

				<a href="#finger_dexterity" className="button">
					Finger Dexterity
				</a>
			</div>
		</Fragment>
	}
}

export default Home;