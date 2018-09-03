const SpawnPattern = function(notesList, scaleList) {
    this.notesList = notesList;
    this.scaleList = scaleList;

    this.loopIndex = 0;
}


SpawnPattern.prototype.random = function() {
    let createdNote = {};

    while (!createdNote.name){
        let randomNote = Math.floor(Math.random()*this.notesList.length - 1);
        if (randomNote != this.loopIndex){
            this.loopIndex = randomNote;
            if (randomNote >= this.notesList.length - 1){randomNote = this.notesList.length - 1};
            createdNote = {...this.notesList[randomNote]};
        }
    }

    return createdNote;
}


SpawnPattern.prototype.ascending = function(skip) {
    let createdNote = {...this.notesList[this.loopIndex]};
    this.loopIndex += skip;
    return createdNote;
}