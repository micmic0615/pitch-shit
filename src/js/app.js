const Application = function() {
	this.score = 0;
	this.correct = 0;
	this.correctMax = 16;
	this.correctPenalty = 0.4;
	this.correctDecayValue = 0.2;
	this.correctDecayInterval = 200;
	this.currentNote = {name:"", octave: 0}
	this.notesList = [
		{name: "G", octave: 3, position: 360},
		{name: "A", octave: 3, position: 330},
		{name: "B", octave: 3, position: 300},
		{name: "C", octave: 4, position: 270},

		{name: "D", octave: 4, position: 240},
		{name: "E", octave: 4, position: 210},
		{name: "F", octave: 4, position: 180},
		{name: "G", octave: 4, position: 150},

		{name: "A", octave: 4, position: 120},
		{name: "B", octave: 4, position: 90},
		{name: "C", octave: 5, position: 60},
		{name: "D", octave: 5, position: 30},

		{name: "E", octave: 5, position: 0},
		{name: "F", octave: 5, position: -30},
		{name: "G", octave: 5, position: -60},
		{name: "A", octave: 5, position: -90},

		{name: "B", octave: 5, position: -120},

		// {name: "C", octave: 6, position: -150},
		// {name: "D", octave: 6, position: -180},
		// {name: "E", octave: 6, position: -210},

		// {name: "F", octave: 6, position: -240},
	];

	this.scaleList = {
		"c_major": [],
		"g_major": ["F"],
		"d_major": ["F", "C"],
		"a_major": ["F", "C", "G"],
		"e_major": ["F", "C", "G", "D"],
	}
}

Application.prototype.drawNote = function(noteItem){
	let noteAppend = document.createElement("div");
	noteAppend.className = "note";
	noteAppend.style.top = noteItem.position + "px";

	if (noteItem.position > 240){
		let staffLine = noteItem.position;
		let staffAdjust = 0;
		while(staffLine - staffAdjust > 240){
			let line = document.createElement("div");
			line.className = noteItem.position % 60 ? "strike mid" : "strike top";
			line.style.marginTop = "-" + staffAdjust + "px"
			noteAppend.appendChild(line);
			staffAdjust += 60;
		}
	}

	if (noteItem.position < -60){
		let staffLine = noteItem.position;
		let staffAdjust = 0;
		while(staffLine - staffAdjust < -60){
			let line = document.createElement("div");
			line.className = noteItem.position % 60 ? "strike mid" : "strike bot";
			line.style.marginTop = (staffAdjust*-1) + "px"
			noteAppend.appendChild(line);
			staffAdjust -= 60;
		}
	}

	this.noteContainer.appendChild(noteAppend);
}

Application.prototype.newNote = function(){
	this.correct = 0;
	this.noteContainer.innerHTML = "";
	this.correctDisplay.style.width = "0%";
	let randomNote = Math.floor(Math.random()*this.notesList.length - 1);
	if (randomNote >= this.notesList.length - 1){randomNote = this.notesList.length - 1};
	this.currentNote = {...this.notesList[randomNote]};

	var currentSharps = this.scaleList[this.scaleSelector.options[this.scaleSelector.selectedIndex].value];
	if (currentSharps.includes(this.currentNote.name)){
		this.currentNote.name = this.currentNote.name + "♯"
	}

	if (!this.currentNote.name){
		this.newNote();
	} else {
		this.drawNote(this.currentNote);
	}
	
}

Application.prototype.start = function(noteStrings){
	this.noteContainer = document.getElementById("note_container");
	this.scoreContainer = document.getElementById("score_container");
	this.scaleSelector = document.getElementById("scale_selector");
	this.correctDisplay = document.getElementById("correct_display");

	if (localStorage.getItem("pitch_shit")){
		this.scaleSelector.value = localStorage.getItem("pitch_shit");
	} else {
		this.scaleSelector.value = "";
	}

	this.scaleSelector.addEventListener("change", ()=>{
		localStorage.setItem("pitch_shit", this.scaleSelector.options[this.scaleSelector.selectedIndex].value)
		this.newNote();
	});

	const decayCorrect = ()=>{
		if (this.correct > 0){this.correct -= this.correctDecayValue}
		else {this.correct = 0};
		this.correctDisplay.style.width = (this.correct*100/this.correctMax) + "%";
		setTimeout(decayCorrect, this.correctDecayInterval)
	}

	decayCorrect();
	this.newNote();
}

Application.prototype.listen = function(note){
	// console.log(note, this.currentNote)
	if (note.name == this.currentNote.name && note.octave == this.currentNote.octave){
		if (this.correct < this.correctMax){
			this.correct++;
			this.correctDisplay.style.width = (this.correct*100/this.correctMax) + "%";
		} else {
			this.score++;
			this.scoreContainer.innerHTML = this.score;
			this.newNote();
		}
	} else {
		if (this.correct > 0){this.correct -= this.correctPenalty}
		else {this.correct = 0};		
		this.correctDisplay.style.width = (this.correct*100/this.correctMax) + "%";
	}
}