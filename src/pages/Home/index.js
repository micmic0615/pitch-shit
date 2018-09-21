import React, { Component } from 'react';
import './style.scss';

class Home extends Component {
	constructor(props){
		super(props);
	}

	render() {
		return (<div className="page_home">
			<div className="container">
				<b id="score_container">0</b>
				<b id="score_assist_container">0</b>
				<b id="score_average_container">0%</b>
				<div className="staff">
					<div className="lines"></div>
					<div className="lines"></div>
					<div className="lines"></div>
					<div className="lines"></div>
					<div className="note"></div>

					<div id="note_container">
						
					</div>

					<div id="note_toastr_container">
						<div className="note_toastr">100%</div>
					</div>
				</div>

				<div id="correct_display">
					<div id="correct_bar"></div>
				</div>
			</div>
			{this.props.note.name}
		</div>)
	}
}

export default Home;