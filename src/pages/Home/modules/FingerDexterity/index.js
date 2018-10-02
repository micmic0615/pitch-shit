import React, { Component } from 'react';
import { setStateAndSave, getStateFromLocalStorage } from 'Assets/scripts/localStorage';

import './style.scss';

class Finger extends Component {
	constructor(props){
		super(props);
		this.key_all = {
			"a90": 0,
			"b88": 1,
			"c67": 2,
			"d86": 3,
			"e66": 4,
			"f78": 5,
			"g77": 6,
			"h188": 7,
		}

		this.key_valid = {
			// "a90": 0,
			"b88": 1,
			// "c67": 2,
			"d86": 3,
			"e66": 4,
			// "f78": 5,
			"g77": 6,
			// "h188": 7,
		}

		this.setStateAndSave = setStateAndSave.bind(this);

		let state_obj = getStateFromLocalStorage({
			max: 0
		});

		state_obj.key_pool = [...this.key_all];
		state_obj.key_sequence = [];
		state_obj.key_valid = true;
		state_obj.key_timer = 6;
		state_obj.score = 0;
		state_obj.average = [];

		this.start_session = false;

		this.state = state_obj
	}

	componentDidMount = ()=>{
		document.onkeydown = this.onKeyPressed;
		this.populateKeys()

		this.timeout = setInterval(()=>{
			if (this.start_session){
				let key_timer = this.state.key_timer - 1;
				let key_valid = this.state.key_valid;
				let score = this.state.score;
				let record_score = this.state.score
				let did_mistake = false;
				if (key_timer <= 0){
					key_valid = false; 
					score = 0;					
					did_mistake = true;
				}
	
				this.setState({key_timer, key_valid, score}, ()=>{
					if (did_mistake){
						this.onMistake(record_score)
					}
				})
			}
			
		}, 100)
	}

	componentWillUnmount = ()=>{
		document.onkeydown = null
	}

	shouldComponentUpdate = (nextProps, nextState)=>{
		let nextPropsEdit = {...nextProps};
		let currentPropsEdit = {...this.props};

		delete nextPropsEdit.note;
		delete currentPropsEdit.note;

		let return_bool = !_.isEqual(nextState, this.state);
		if (return_bool == false){return_bool = !_.isEqual(nextPropsEdit, currentPropsEdit)};

		return return_bool
	}

	populateKeys = (num = 10)=>{
		let index = 0;
		let key_sequence = [...this.state.key_sequence];
		let valid_keys = Object.keys(this.key_valid);
		while(index < num){
			let seed = Math.floor(Math.random()*(valid_keys.length));
			if (seed >= this.key_valid.length){seed = this.key_valid.length - 1};
			key_sequence.push(this.key_valid[valid_keys[seed]])
			index++;
		}
		
		this.setState({key_sequence})
	}

	renderKey = (key_index, opacity = 1)=>{
		let return_array = [];
		let all_keys = Object.keys(this.key_all);

		all_keys.forEach((key, index)=>{
			let class_name = "button"
			if (!_.isEmptyArray(this.state.key_sequence) && this.key_all[key] == this.state.key_sequence[key_index]){
				class_name += " active";
			}

			return_array.push(<div key={index + "keyname"} className={class_name}></div>)
		})
		return <div className="row" style={{opacity: opacity}}>{return_array}</div>;
	}

	onMistake = (record_score)=>{
		if (this.start_session){
			let average = [...this.state.average];
			average.push(record_score);
			this.setState({average: average});
			this.start_session = false;
		}
	}

	onKeyPressed = (e)=>{
	
		let all_keys = Object.keys(this.key_all);
		let keycodes = all_keys.map((item)=>{return item.substring(1)});
		let key_string = String(e.keyCode);

		if (keycodes.includes(key_string)){
			let key_value = this.key_all[all_keys.find(p=>(p.substring(1) == key_string))]
			
			if (!_.isEmptyArray(this.state.key_sequence)){
				
				if (key_value == this.state.key_sequence[0]){
					this.start_session = true;
					let state_obj = {};

					if (this.state.key_valid == true){
						state_obj.score = this.state.score + 1;
						state_obj.max = this.state.max;
						if (state_obj.score > state_obj.max){state_obj.max = state_obj.score}
					};

					state_obj.key_sequence = [...this.state.key_sequence];
					state_obj.key_sequence.shift();
					state_obj.key_valid = true;
					state_obj.key_timer = 5;

					this.setState(state_obj, ()=>{
						this.setStateAndSave({max: this.state.max})
						if (this.state.key_sequence.length <= 5){
							this.populateKeys()
						}
					})
				} else if (this.state.key_valid == true){
					let record_score = this.state.score
					this.setState({key_valid: false, score: 0}, ()=>{
						this.onMistake(record_score)
					})
				}
			}
		}
	}

	render() {
	
		return (<div id="main_container" className="finger_dexterity" >
			<div className="key_interface">
				<div className="divider" style={{left: "0%", borderLeft:"none"}}></div>
				<div className="divider" style={{left: "25%"}}></div>
				<div className="divider" style={{left: "50%"}}></div>
				<div className="divider" style={{left: "75%"}}></div>

				<div className="fader">

				</div>

				<div className="score_display f_neuzeit">
					<div className="score_average">{(()=>{
						if (!_.isEmptyArray(this.state.average)){
							let average_number = Math.round(((this.state.average.reduce((a, b) => a + b, 0)) / this.state.average.length)*100)/100;

							let whole_number = Math.floor(average_number);
							let decimal_number = String(Math.round((average_number - whole_number)*100));
							while(decimal_number.length < 2){decimal_number += "0"}
							return String(whole_number) + "." + String(decimal_number)
						} else {
							return "0.00"
						}
					})()}</div>
					<div className="score_value">{(()=>{return String(this.state.score) + " / " + String(this.state.max)})()}</div>					
				</div>

				<div className="next_container">
					{this.renderKey(3, 1)}
					{this.renderKey(2, 1)}
					{this.renderKey(1, 1)}
					{this.renderKey(0, 1)}
				</div>

				<div className="button_container">
					{(()=>{
						let return_array = [];
						let all_keys = Object.keys(this.key_all);

						all_keys.forEach((key, index)=>{
							let class_name = "button"
							if (!_.isEmptyArray(this.state.key_sequence) && this.key_all[key] == this.state.key_sequence[0]){
								class_name += this.state.key_valid ? (" active timer" + this.state.key_timer) : " mistake"
							}

							if (_.isNil(this.key_valid[key])){
								class_name += " disabled"
							}

							let finger_name = 0;

							switch(key){
								case "a90": finger_name = "4.z"; break
								case "b88": finger_name = "4.x"; break
								case "c67": finger_name = "3.c"; break
								case "d86": finger_name = "3.v"; break
								case "e66": finger_name = "2.b"; break
								case "f78": finger_name = "2.n"; break
								case "g77": finger_name = "1.m"; break
								case "h188": finger_name = "1.<"; break
							}

							return_array.push(<div key={index + "keybutton"} className={class_name}>
								{finger_name}
							</div>)
						})
						return return_array;
					})()}
				</div>
			</div>

			
		</div>)
	}
}

export default Finger;