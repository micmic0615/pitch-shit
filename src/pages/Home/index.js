import React, { Component } from 'react';
import './style.scss';

class Home extends Component {
	constructor(props){
		super(props);
	}

	render() {
		return (<div className="page_home">
			{this.props.note.name}
		</div>)
	}
}

export default Home;