const Pitch = function(app) {
    this.tuner = new Tuner();
    // this.frequencyBars = new FrequencyBars('.frequency-bars');
    this.value_check = [];
	this.app = app;
	
    app.start(this.tuner.noteStrings);
}

Pitch.prototype.start = function() {
	this.tuner.onNoteDetected = (note)=>{
		if (note.octave >= 3 && note.frequency > 190){
			this.value_check.push(note.value)
			if (this.value_check.length >= 3){this.value_check.shift()};
	
			let average_value = 0;
			this.value_check.forEach((value)=>{average_value += (value/this.value_check.length)});
	
			if (note.value >= average_value - 5 && note.value <= average_value + 5 ){
				this.app.listen(note)
			}
		}
	};

	this.tuner.init();
	this.frequencyData = new Uint8Array(this.tuner.analyser.frequencyBinCount);
}

Pitch.prototype.updateFrequencyBars = function() {
	if (this.tuner.analyser) {
		this.tuner.analyser.getByteFrequencyData(this.frequencyData)
		// this.frequencyBars.update(this.frequencyData)
    };
    
	// requestAnimationFrame(this.updateFrequencyBars.bind(this))
}

window.onload = function(){new Pitch(new Application()).start()};