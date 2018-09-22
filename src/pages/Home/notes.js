export const generateNote = function(count = 1){
    let render_notes_list = [...this.state.render_notes_list];
    let render_notes_all = this.state.render_notes_all.filter(p=>(p.active == true));

    while(count > 0){
        let random_seed = Math.floor(Math.random()*(render_notes_all.length));
        if (random_seed == render_notes_all.length){random_seed = render_notes_all.length - 1};
    
        if (!_.isNil(this.previous_note)){
            while(random_seed == this.previous_note){
                random_seed = Math.floor(Math.random()*(render_notes_all.length));
                if (random_seed == render_notes_all.length){random_seed = render_notes_all.length - 1};
            }
        }

        this.previous_note = random_seed;
        render_notes_list.push( render_notes_all[random_seed] )
        count--
    }
   
    this.setState({render_notes_list});
}

export const validateNote = function(note){
    if (note.frequency > 190 && note.frequency < 1500){
    
        let valid_note = false;
        switch(this.state.noise_filter){
            case "frequency":
                if (_.isEmptyArray(this.note_target)){
                    this.note_target = [ note.frequency ]
                } else {
                    let last_note = this.note_target[this.note_target.length - 1];
                    if (Math.abs(note.frequency - last_note) < 5){
                        valid_note = true;
                    } else {
                        if (_.isEmptyArray(this.note_test)){
                            this.note_test = [ note.frequency ];
                        } else {
                            let last_test = this.note_test[this.note_test.length - 1];
                            if (Math.abs(note.frequency - last_test) < 5){
                                this.note_test.push(note.frequency);
                            } else {
                                this.note_test = [ note.frequency ]
                            }
    
                            if (this.note_test.length > 3){
                                this.note_target = [ ...this.note_test ];
                                valid_note = true;
                            }
                        }
                    }
                };
                break
            
            case "name":
            default: 
                if (_.isEmptyArray(this.note_target)){
                    this.note_target = [ note.name ]
                } else {
                    let last_note = this.note_target[this.note_target.length - 1];
                    if (note.name == last_note){
                        valid_note = true;
                    } else {
                        if (_.isEmptyArray(this.note_test)){
                            this.note_test = [ note.name ];
                        } else {
                            let last_test = this.note_test[this.note_test.length - 1];
                            if (note.name == last_test){
                                this.note_test.push(note.name);
                            } else {
                                this.note_test = [ note.name ]
                            }
    
                            if (this.note_test.length > 3){
                                this.note_target = [ ...this.note_test ];
                                valid_note = true;
                            }
                        }
                    }
                };
                break
        }

        if (valid_note){
            this.note_test = [];
            this.note_target.push(note[this.state.noise_filter])
            this.readNote(note)
        }
    }
}