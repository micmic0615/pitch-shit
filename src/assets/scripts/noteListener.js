const NoteListener = function(callback){
	this.callback = callback;
	this.value_check = []
}

NoteListener.prototype.listen = function(note){
	if (note.octave >= 3 && note.frequency > 190){
		this.value_check.push(note.value)
		if (this.value_check.length >= 3){this.value_check.shift()};

		let average_value = 0;
		this.value_check.forEach((value)=>{average_value += (value/this.value_check.length)});

		if (note.value >= average_value - 5 && note.value <= average_value + 5 ){
			this.callback(note)
		}
	}
}

export default NoteListener


