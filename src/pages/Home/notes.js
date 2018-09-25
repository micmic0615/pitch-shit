export const generateNote = function(count = 0, callback){
    let notes_list = [...this.state.notes_list];
    let notes_pool = this.state.notes_pool.filter(p=>(p.active == true));
    if (notes_pool.length > 1){
        while(count > 0){
            let random_seed = Math.floor(Math.random()*(notes_pool.length));
            if (random_seed == notes_pool.length){random_seed = notes_pool.length - 1};
        
            if (!_.isNil(this.previous_note)){
                while(random_seed == this.previous_note){
                    random_seed = Math.floor(Math.random()*(notes_pool.length));
                    if (random_seed == notes_pool.length){random_seed = notes_pool.length - 1};
                }
            }
    
            this.previous_note = random_seed;
            notes_list.push( notes_pool[random_seed] )
            count--
        }
    }
   
    this.setState({notes_list}, ()=>{
        if (!_.isNil(callback) && _.isFunction(callback)){callback()}
    });
}

export const validateNote = function(note){
    if (note.frequency > 190 && note.frequency < 1600){
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