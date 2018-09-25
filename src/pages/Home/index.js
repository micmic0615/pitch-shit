import React, { Component, Fragment } from 'react';
import { setStateAndSave, getStateFromLocalStorage } from 'Assets/scripts/localStorage';
import NoteList from 'Constants/noteList.js';
import ScaleList from 'Constants/scaleList.js';
import { generateNote, validateNote } from './notes';

import { faMusic, faPlay, faPause, faMarker } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './style.scss';


class Home extends Component {
	constructor(props){
		super(props);

		this.setStateAndSave = setStateAndSave.bind(this);
		this.generateNote = generateNote.bind(this);
		this.validateNote = validateNote.bind(this);

		let state_object = getStateFromLocalStorage({
			key_signature_value: 0,
			key_signature_name: "c_major",			
			noise_filter: "name",
			notes_pool: [...NoteList],
			progress_required: 50,
		});

		state_object.running = 0;
		state_object.notes_edit = false;
		state_object.notes_list = [];
		state_object.notes_index = 0;
		state_object.notes_index_start = 0;
		state_object.notes_index_range = 12;
		state_object.notes_index_count = true;
		state_object.score = 0;
		state_object.errors = 0;
		state_object.combo = 0;
		state_object.progress_current = 0;

		this.state = {...state_object}

		this.clock = 0;
		let increment_clock = ()=>{
			if (this.state.running == 1){this.clock += 0.1}
		}

		setInterval(increment_clock, 100)

		this.note_current = {
			correct: 0,
			correct_max: 15,
			
			mistake: 0,
			mistake_max: 25,
			mistake_padding: 4,
			mistake_padding_max: 4,
			
			rating: [],
		}

		this.combo_max = 0;

		this.sounds = {
			"ding": new Audio(_.imgPath("./img/ding.ogg")),
			"dong": new Audio(_.imgPath("./img/dong.ogg")),
			"dingding": new Audio(_.imgPath("./img/dingding.ogg")),
		}
	}

	componentDidMount = ()=>{
		this.generateNote(this.state.progress_required)
	}

	componentWillReceiveProps = (props)=>{
		if (this.state.notes_edit != true && this.state.running == 1 && !_.isEqual(this.props.note, props.note)){
			this.validateNote(props.note)
		}
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

	setKeySignature = (value, name)=>{
		this.setStateAndSave({
			key_signature_value: value,
			key_signature_name: name
		})
	}

	changeModeEditNotes = ()=>{
		this.setState({
			notes_list: [...this.state.notes_pool],
			notes_index: 0,
			notes_index_start: 0,
			notes_edit: true
		})
	}

	changeModePlayNotes = ()=>{
		this.setState({
			notes_list: [],
			notes_index: 0,
			notes_index_start: 0,
			notes_edit: false,
		}, ()=>{
			this.generateNote(this.state.progress_required)
		})
	}

	editModeToggleNote = (index)=>{
		if (this.state.notes_edit == true){
			let notes_pool = _.jsonClone([...this.state.notes_pool]);
			notes_pool[index].active = !notes_pool[index].active;
			this.setState({notes_list: notes_pool}, ()=>{
				this.setStateAndSave({notes_pool: notes_pool})
			})
		}
	}

	unpause = ()=>{
		this.setState({running: 1}, ()=>{
			if (this.state.progress_current >= this.state.progress_required){
				this.setState({notes_list: []}, ()=>{
					this.generateNote(this.state.progress_required, ()=>{
						this.clock = 0;
						this.combo_max = 0;
						this.setState({
							notes_index: 0, 								
							progress_current: 0,
							score: 0,
							combo: 0,
							errors: 0
						})
					})
				})				
			}
		})
	}

	changeRequired = (e)=>{
		if (this.state.notes_edit){
			let value = e.target.value;
			if (_.isFinite(parseInt(value))){
				this.setStateAndSave({
					progress_required: parseInt(value)
				})
			}
		}
	}

	readNote = (note)=>{
		let sharps_list = ScaleList[this.state.key_signature_name];
		let required_note = this.state.notes_list[this.state.notes_index];
		let required_name = required_note.name;
		let required_perfect = required_note.perfect[0];
		
		if (sharps_list.includes(required_name)){
			required_perfect = required_note.perfect[1];
			switch(required_name){
				case "E": required_name = "F"; break;
				case "B": required_name = "C"; break;
				default: required_name += "♯"; break;
			}
		}

		let frequency_difference = Math.abs(required_perfect - note.frequency);
		
		if (note.name == required_name && frequency_difference < 15){
			this.note_current.correct += 1;
			this.note_current.rating.push(frequency_difference);

			if (this.note_current.correct >= this.note_current.correct_max){
				
				
				let correct_ratio = (this.note_current.correct / (this.note_current.mistake + this.note_current.correct))*70;
				let perfect_ratio = ((15 - (this.note_current.rating.reduce((a, b) => a + b, 0) / this.note_current.rating.length)) / 15)*30;
				let note_percent = correct_ratio + perfect_ratio;
				let note_score = this.state.notes_index_count ? Math.round(((note_percent)*10000) / this.state.progress_required) : 0;

				let notes_list = _.jsonClone([...this.state.notes_list])
				notes_list[this.state.notes_index].accuracy = Math.round(correct_ratio*100/70);
				notes_list[this.state.notes_index].precision = Math.round(perfect_ratio*100/30)

				let incremented_index = this.state.notes_index + 1;
				let notes_index_start = this.state.notes_index_start
				if (incremented_index >= this.state.notes_index_start + this.state.notes_index_range){
					notes_index_start = this.state.notes_index_start + this.state.notes_index_range
				}

				let progress_current = Math.min(this.state.progress_current + 1, this.state.progress_required);

				let running = this.state.running;
				
				this.sounds.ding.currentTime = 0
				this.sounds.ding.play()
				if (progress_current == this.state.progress_required){
					incremented_index = incremented_index - 1;
					running = 3;

					this.sounds.dingding.currentTime = 0
					this.sounds.dingding.play()
				}

				let combo = this.state.notes_index_count ? this.state.combo + 1 : 0;
				if (combo >= this.combo_max){this.combo_max = combo}

				this.setState({
					notes_index: incremented_index, 
					score: Math.min(this.state.score + note_score, 1000000),
					notes_index_count: true,
					notes_index_assist: "",
					notes_index_start,
					progress_current,
					running,
					combo,
					notes_list,
				}, ()=>{
					this.note_current.correct = 0;
					this.note_current.mistake = 0;
					this.note_current.rating = [];
					this.note_current.mistake_padding = this.note_current.mistake_padding_max;
					
				})
			} else {
				if (!this.state.notes_index_count){
					this.setState({
						notes_index_assist: "correct",
					});
				}
			}
		} else {
			if (this.note_current.mistake_padding <= 0){
				this.note_current.mistake += 1;
				if (this.note_current.mistake >= this.note_current.mistake_max && this.state.notes_index_count){
					this.sounds.dong.currentTime = 0
					this.sounds.dong.play()
					this.setState({
						notes_index_count: false,
						combo: 0,
						errors: this.state.errors + 1
					});
				} else {
					this.note_current.correct = 0;
				}

				if (!this.state.notes_index_count){
					this.setState({
						notes_index_assist: required_perfect > note.frequency ? "higher" : "lower",
					});
				}
			} else {
				this.note_current.mistake_padding -= 1;
			}
		}
	}

	renderMeasure = (start, end)=>{
		let sliced_list = this.state.notes_list.slice(this.state.notes_index_start + start, this.state.notes_index_start + end);
		if (!_.isEmptyArray(sliced_list)){
			return sliced_list.map((note, index)=>{return this.renderNotes(note, index, start)})
		} else {
			return <div className="disabler"></div>
		}
	}

	renderNotes = (note, index, index_edit = 0)=>{
		let real_index = index + index_edit + this.state.notes_index_start;
	
		let note_active = note.active;
		let note_being_read = false;
		if (!this.state.notes_edit){
			note_active = Boolean(this.state.notes_index >= this.state.notes_index_start + index_edit && this.state.notes_index < this.state.notes_index_start + index_edit+ 4);
			note_being_read = Boolean(real_index == this.state.notes_index);
		}
	
		let edit_color = "";
		switch(note.string){
			case "G": edit_color = "#363"; break;
			case "D": edit_color = "#336"; break
			case "A": edit_color = "#633"; break
			case "E": edit_color = "#525"; break
			default:  edit_color = "#552"; break
		}

		let sharp_list = ScaleList[this.state.key_signature_name];
		let note_name = note.name;

		if (sharp_list.includes(note_name)){
			switch(note_name){
				case "E": note_name = "F"; break;
				case "B": note_name = "C"; break;
				default: note_name += "♯"; break;
			}
		}

		let note_color = this.state.notes_edit ? edit_color : "#333";
		if (note_being_read){
			note_color = this.state.notes_index_count == true ? "#0dd" : "#f00";
		}

		return <div 
			key={real_index + "_map_notes_list"}
			className={note_being_read ? ("notes " + this.state.notes_index_assist) : "notes"} 
			onClick={()=>{this.editModeToggleNote(real_index)}}
			style={{
				marginTop:note.position + "px", 
				left: ((20 + (index*(this.state.notes_edit ? 55 : 80)))) + "px",
				cursor: this.state.notes_edit ? "pointer" : "default",
				opacity: note_active ? 1 : 0.25,
				background: note_color,
				boxShadow: note_color != "#333" ? ("0px 0px 6px " + note_color) : "none"
			}}
		>
			<div className="assist"></div>
			<div className="accuracy">{_.isNil(note.accuracy) ? "" : note.accuracy}</div>
			{!this.state.notes_edit ?  null : <span>{note_name}</span>}
			{(()=>{
				let strikes = [];
				let note_position = (note.position % 50 != 0) ? ( note.position + 25) : note.position;
				let top_adjust =  (note.position % 50 != 0) ? -25 : 0;

				while(note_position  >= 425){
					strikes.push(<div className="strike" key={real_index +"_" +note_position} style={{top: (top_adjust*-1) + "px", backgroundColor: note_color}}></div>);
					top_adjust += 50;
					note_position -= 50;
				}

				while(note_position <= 150){
					strikes.push(<div className="strike bot" key={real_index +"_" +note_position} style={{top: (top_adjust*1) + "px", backgroundColor: note_color}}></div>);
					top_adjust += 50;
					note_position += 50;
				}
				
				return strikes
			})()}
		</div>
	}

	renderPauseMenu = ()=>{
		return <div className="blocker f_neuzeit" onClick={this.unpause} style={{display: this.state.running != 1 ? "flex" : "none"}}>
			{(()=>{
				switch(this.state.running){
					case 0: return "click anywhere to start";
					case 2: return "p a u s e d";

					case 3: 
						let accuracy = 0;
						this.state.notes_list.forEach((note)=>{accuracy += note.accuracy / this.state.notes_list.length});

						let precision = 0;
						this.state.notes_list.forEach((note)=>{precision += note.precision / this.state.notes_list.length});
						
						return <div className="congrats" >
							<table>
								<tbody>
									<tr className="title">
										<td colSpan="2">FINISHED</td>
									</tr>

									<tr className="data">
										<td className="label">Score:</td>
										<td className="value">{this.state.score}</td>
									</tr>

									<tr className="data">
										<td className="label">Time:</td>
										<td className="value">{Math.round(this.clock) + " sec."}</td>
									</tr>

									<tr className="data">
										<td className="label">Max Combo:</td>
										<td className="value">{this.combo_max}</td>
									</tr>									

									<tr className="data">
										<td className="label">Accuracy:</td>
										<td className="value">{Math.round(accuracy)}%</td>
									</tr>

									<tr className="data">
										<td className="label">Precision:</td>
										<td className="value">{Math.round(precision)}%</td>
									</tr>

									<tr className="data">
										<td className="label">Errors:</td>
										<td className="value">{this.state.errors} / {this.state.progress_required} ({Math.round(this.state.errors*100/this.state.progress_required)}%)</td>
									</tr>

									<tr className="footnote">
										<td colSpan="2">click anywhere to try again</td>
									</tr>
								</tbody>
							</table>
						</div>;

					case 1: return "";
					default: 
				}
			})()}
		</div>
	}

	

	render() {
		return (<div id="main_container" className="page_home">
			<div className="staff">
				<div className="g_clef" onClick={()=>{this.setKeySignature(0, "c_major")}}><img src={_.imgPath("./img/g_clef.svg")} alt=""/></div>
				
				<div onClick={()=>{this.setKeySignature(1, "g_major")}} className={"sharps " + (this.state.key_signature_value < 1 ? "disabled" : "")} style={{marginTop: "-45px", marginLeft: "100px"}}  ><span>♯</span></div>
				<div onClick={()=>{this.setKeySignature(2, "d_major")}} className={"sharps " + (this.state.key_signature_value < 2 ? "disabled" : "")} style={{marginTop: "30px", marginLeft: "125px"}}  ><span>♯</span></div>
				<div onClick={()=>{this.setKeySignature(3, "a_major")}} className={"sharps " + (this.state.key_signature_value < 3 ? "disabled" : "")} style={{marginTop: "-65px", marginLeft: "150px"}}  ><span>♯</span></div>
				<div onClick={()=>{this.setKeySignature(4, "e_major")}} className={"sharps " + (this.state.key_signature_value < 4 ? "disabled" : "")} style={{marginTop: "10px", marginLeft: "175px"}}  ><span>♯</span></div>
				<div onClick={()=>{this.setKeySignature(5, "b_major")}} className={"sharps " + (this.state.key_signature_value < 5 ? "disabled" : "")} style={{marginTop: "80px", marginLeft: "200px"}}  ><span>♯</span></div>
				<div onClick={()=>{this.setKeySignature(6, "f♯_major")}} className={"sharps " + (this.state.key_signature_value < 6 ? "disabled" : "")} style={{marginTop: "-15px", marginLeft: "225px"}}  ><span>♯</span></div>
				<div onClick={()=>{this.setKeySignature(7, "c♯_major")}} className={"sharps " + (this.state.key_signature_value < 7 ? "disabled" : "")} style={{marginTop: "60px", marginLeft: "250px"}}  ><span>♯</span></div>
			

				<div className="lines"></div>
				<div className="lines"></div>
				<div className="lines"></div>
				<div className="lines last"></div>
				{this.state.notes_list.length < 1 ? null : <div className={"notes_container " + (this.state.notes_edit ? "edit" : "")}>
					{this.state.notes_edit ? <div className="measure">{this.state.notes_list.map((note, index)=>{return this.renderNotes(note, index)})}</div> : <Fragment>
						<div className="measure">{this.renderMeasure(0,4)}</div>
						<div className="measure">{this.renderMeasure(4,8)}</div>
						<div className="measure">{this.renderMeasure(8,12)}</div>
					</Fragment>}
				</div>}
				
			</div>

			{this.renderPauseMenu()}

			<div className="note_checker">
				noise filter <b onClick={()=>{this.setStateAndSave({noise_filter: this.state.noise_filter == "name" ? "frequency" : "name"})}}>{this.state.noise_filter}</b>
			</div>

			<div className="top_menu">
				<div className="button" onClick={this.state.notes_edit ? this.changeModePlayNotes : this.changeModeEditNotes}>
					<FontAwesomeIcon icon={this.state.notes_edit == true ? faMusic : faMarker}/>
				</div>

				<div 
					className="button" 
					onClick={()=>{if (this.state.notes_edit == false) {this.setState({running: this.state.running == 1 ? 2 : 1})}}}
					style={{opacity: this.state.notes_edit == false ? 1 : 0.5}}
				>
					<FontAwesomeIcon icon={this.state.notes_edit == true || this.state.running == 2 ? faPlay : faPause}/>
				</div>
			</div>

			<div className="score_display f_neuzeit">
				<div className="score_value">{(()=>{
					let string_score = String(this.state.score);
					while (string_score.length < 7){string_score = "0" + string_score}
					return string_score;
				})()}</div>

				<div className="combo_value">{(()=>{
					let string_combo = String(this.state.combo)
					while (string_combo.length < String(this.state.progress_required).length){string_combo = "0" + string_combo}

					return <Fragment><span style={{color: this.state.combo >= this.combo_max ? "#39c" : "#c66"}}>{string_combo}</span>{ " [" + this.combo_max + "]"}</Fragment>;
				})()}</div>
			</div>


			<div className="progress_bar" style={{display: this.state.running == 1 ? "block" : "none"}}>
				<input type="text" style={{display: this.state.notes_edit ? "block" : "none"}} value={this.state.progress_required} onChange={this.changeRequired}/>
				<div className="progress_meter" style={{width: (Math.round(this.state.progress_current*100 / this.state.progress_required)) + "%"}}></div>
			</div>

		</div>)
	}
}

export default Home;