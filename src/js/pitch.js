const Pitch = function(app) {
    this.tuner = new Tuner();
    this.frequencyBars = new FrequencyBars('.frequency-bars');
    
    this.app = app;
    app.start(this.tuner.noteStrings);
}

Pitch.prototype.start = function() {
	this.tuner.onNoteDetected = (note)=>{this.app.listen(note)};

	this.tuner.init();
	this.frequencyData = new Uint8Array(this.tuner.analyser.frequencyBinCount);

	if (!/Android/i.test(navigator.userAgent)) {this.updateFrequencyBars()};
}

Pitch.prototype.updateFrequencyBars = function() {
	if (this.tuner.analyser) {
		this.tuner.analyser.getByteFrequencyData(this.frequencyData)
		this.frequencyBars.update(this.frequencyData)
    };
    
	requestAnimationFrame(this.updateFrequencyBars.bind(this))
}

window.onload = function(){new Pitch(new Application()).start()};