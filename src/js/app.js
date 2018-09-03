const Application = function() {
	this.score = 0;
	this.scoreAssist = 0;
	this.correct = 0;
	this.correctMax = 10;
	this.correctPenalty = 0.5;
	this.correctDecayValue = 0.25;
	this.correctDecayInterval = 100;
	this.correctDecayDelay = 5;
	this.correctDecayDelayMax = 5;
	this.correctAssist = 0;
	this.correctAssistTreshold = 10;
	this.correctAverage = 0;
	this.correctPositive = 0;
	this.correctNegative = 0;
	this.currentNote = {name:"", octave: 0};
	this.currentNoteBatch = [];
	this.currentNoteIndex = 0;

	this.correctDing = new Audio('assets/sounds/ding.ogg');

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

	this.spawnPattern = new SpawnPattern(this.notesList, this.scaleList);
}

Application.prototype.drawNote = function(noteItem, index){
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

	noteAppend.style.opacity = index == this.currentNoteIndex ? 1 : 0.35;
	this.noteContainer.appendChild(noteAppend);
}

Application.prototype.newNote = function(pattern = "random"){
	this.correct = 0;
	this.correctPositive = 0;
	this.correctNegative = 0;

	this.correctAssist = 0;
	this.correctDislay.style.opacity = 0;
	this.correctBar.style.width = "0%";

	if (this.currentNoteIndex < this.currentNoteBatch.length - 1){
		this.currentNoteIndex++;
	} else {
		this.currentNoteIndex = 0;
		this.currentNoteBatch = [];
		
		this.spawnPattern.loopIndex = Math.round(Math.random()*(this.notesList.length - 4));
		if (this.spawnPattern.loopIndex > this.notesList.length - 4){this.spawnPattern.loopIndex = this.notesList.length - 4}

		// this.spawnPattern.loopIndex = 0
		
		while(this.currentNoteBatch.length < 4){
			let createdNote = this.spawnPattern[pattern](1);
	
			let currentSharps = this.scaleList[this.scaleSelector.options[this.scaleSelector.selectedIndex].value];
			if (currentSharps.includes(createdNote.name)){
				createdNote.name = createdNote.name + "♯"
			}
	
			this.currentNoteBatch.push(createdNote);
		}
	};

	this.noteContainer.innerHTML = "";
	this.currentNoteBatch.forEach((note, index)=>{
		this.drawNote(note, index);
	})

	this.currentNote = {...this.currentNoteBatch[this.currentNoteIndex]};
}

Application.prototype.start = function(){
	
	this.noteContainer = document.getElementById("note_container");
	this.scoreContainer = document.getElementById("score_container");
	this.scoreAssistContainer = document.getElementById("score_assist_container");
	this.scoreAverageContainer = document.getElementById("score_average_container");
	this.noteToastrContainer = document.getElementById("note_toastr_container");
	this.scaleSelector = document.getElementById("scale_selector");
	this.correctBar = document.getElementById("correct_bar");
	this.correctDislay = document.getElementById("correct_display");

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
		if (this.correctDecayDelay > 0){this.correctDecayDelay -= 1} 
		else {
			if (this.correct > 0){this.correct -= this.correctDecayValue}
			else {this.correct = 0};
			this.correctBar.style.width = (this.correct*100/this.correctMax) + "%";
		}
		
		setTimeout(decayCorrect, this.correctDecayInterval)
	}

	decayCorrect();
	this.newNote();
}

Application.prototype.listen = function(note){
	console.log(note)
	if (note.name == this.currentNote.name && note.octave == this.currentNote.octave){
		this.correctPositive++;
		if (this.correct < this.correctMax){
			this.correct++;
			this.correctDecayDelay = this.correctDecayDelayMax;
			this.correctBar.style.width = (this.correct*100/this.correctMax) + "%";
		} else {
			this.correctDing.currentTime = 0;
			this.correctDing.play();

			this.score++;
			this.scoreContainer.innerHTML = this.score;
			let correctRate =  Math.round((this.correctPositive*100) / (this.correctPositive + this.correctNegative));
			let correctToastr = document.createElement("div");
			correctToastr.className = "note_toastr";
			correctToastr.innerHTML = correctRate + "%";

			this.correctAverage += correctRate;

			this.scoreAverageContainer.innerHTML = Math.round(this.correctAverage / this.score) + "%";

			this.noteToastrContainer.appendChild(correctToastr)

			setTimeout(()=>{
				correctToastr.style.top = "-120px";
				correctToastr.style.opacity = "0";
			},100);

			setTimeout(()=>{
				this.noteToastrContainer.removeChild(correctToastr);
			},2200);

			this.newNote();
		}
	} else {
		this.correctDecayDelay = 0;
		this.correctNegative++;
		if (this.correct > 0){this.correct -= this.correctPenalty} else {this.correct = 0};		
		this.correctAssist += this.correctPenalty;
		this.correctBar.style.width = (this.correct*100/this.correctMax) + "%";
		if (this.correctAssist >= this.correctAssistTreshold && this.correctDislay.style.opacity == 0){this.scoreAssist++};
		this.scoreAssistContainer.innerHTML = this.scoreAssist;
		this.correctDislay.style.opacity = this.correctAssist >= this.correctAssistTreshold ? 1 : 0;
	}
}