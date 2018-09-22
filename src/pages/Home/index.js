import React, { Component } from 'react';
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

			render_notes_all: [...NoteList]
		});

		state_object.running = 0;

		state_object.render_notes_edit = false;

		state_object.render_notes_list = [];

		state_object.render_notes_index = 0;

		this.state = {...state_object}

		this.note_target = [];
		this.note_test = [];
	}

	componentDidMount = ()=>{
		this.generateNote(4)
	}

	componentWillReceiveProps = (props)=>{
		if (this.state.render_notes_edit != true && this.state.running == 1 && !_.isEqual(this.props.note, props.note)){
			this.validateNote(props.note)
		}
	}

	readNote = (note)=>{
		console.log(note)
	}

	setKeySignature = (value, name)=>{
		this.setStateAndSave({
			key_signature_value: value,
			key_signature_name: name
		})
	}

	changeModeEditNotes = ()=>{
		this.setState({
			render_notes_list: [...this.state.render_notes_all],
			render_notes_edit: true
		})
	}

	changeModePlayNotes = ()=>{
		this.setState({
			render_notes_list: [],
			render_notes_edit: false
		}, ()=>{
			this.generateNote(4)
		})
	}

	editModeToggleNote = (index)=>{
		if (this.state.render_notes_edit == true){
			let render_notes_all = [...this.state.render_notes_all];
			render_notes_all[index].active = !render_notes_all[index].active;

			this.setStateAndSave({render_notes_all})
		}
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

				{this.state.render_notes_list.map((note, index)=>{
					let edit_color = "";
					switch(note.string){
						case "G": edit_color = "#363"; break;
						case "D": edit_color = "#336"; break
						case "A": edit_color = "#633"; break
						case "E": edit_color = "#525"; break
						default:  edit_color = "#552"; break
					}

					let sharp_list = ScaleList[this.state.key_signature_name];
					return <div 
						key={index + "_map_notes_list"}
						className="notes" 
						onClick={()=>{this.editModeToggleNote(index)}}
						style={{
							marginTop:note.position + "px", 
							marginLeft: (index*(this.state.render_notes_edit ? 55 : 75)) + "px",
							cursor: this.state.render_notes_edit ? "pointer" : "default",
							opacity: note.active ? 1 : 0.25,
							backgroundColor: this.state.render_notes_edit ? edit_color : "#333"
						}}
					>
						{!this.state.render_notes_edit ?  null : <span>{sharp_list.includes(note.name) ? (note.name + "♯") : note.name}</span>}
						{(()=>{
							let strikes = [];
							let note_position = (note.position % 50 != 0) ? ( note.position + 25) : note.position;
							let top_adjust =  (note.position % 50 != 0) ? -25 : 0;

							while(note_position  >= 425){
								strikes.push(<div className="strike" key={index +"_" +note_position} style={{top: (top_adjust*-1) + "px"}}></div>);
								top_adjust += 50;
								note_position -= 50;
							}

							while(note_position <= 150){
								strikes.push(<div className="strike bot" key={index +"_" +note_position} style={{top: (top_adjust*1) + "px"}}></div>);
								top_adjust += 50;
								note_position += 50
							}
							
							return strikes
						})()}
					</div>
				})}
			</div>

			<div className="blocker f_neuzeit" onClick={()=>{this.setState({running: 1})}} style={{display: this.state.running != 1 ? "flex" : "none"}}>
				{(()=>{
					switch(this.state.running){
						case 0: return "click anywhere to start";
						case 1: return "";
						case 2: 
						default: return "Paused";
					}
				})()}
			</div>

			<div className="note_checker">
				noise filter <b onClick={()=>{this.setStateAndSave({noise_filter: this.state.noise_filter == "name" ? "frequency" : "name"})}}>{this.state.noise_filter}</b>
			</div>

			<div className="top_menu">
				<div className="button" onClick={this.state.render_notes_edit ? this.changeModePlayNotes : this.changeModeEditNotes}>
					<FontAwesomeIcon icon={this.state.render_notes_edit == true ? faMusic : faMarker}/>
				</div>

				<div 
					className="button" 
					onClick={()=>{if (this.state.render_notes_edit == false) {this.setState({running: this.state.running == 1 ? 2 : 1})}}}
					style={{opacity: this.state.render_notes_edit == false ? 1 : 0.5}}
				>
					<FontAwesomeIcon icon={this.state.render_notes_edit == true || this.state.running == 2 ? faPlay : faPause}/>
				</div>
			</div>
		</div>)
	}
}

export default Home;