// import { setStateAndSave, getStateFromLocalStorage } from 'Assets/scripts/localStorage';
import NoteList from 'Constants/noteList.js';
import ScaleList from 'Constants/scaleList.js';

export const getPrecisionBase = function(note, is_sharp){
    let hertz_list = [];
    NoteList.forEach((note_list_item)=>{
        hertz_list.push(note_list_item.perfect[0])
        hertz_list.push(note_list_item.perfect[1])
    });

    let base_frequency = note.perfect[is_sharp ? 1 : 0];
    let next_frequency = 0;
    let prev_frequency = 0;
    let divider = 2;

    hertz_list.forEach((hertz, index)=>{
        if (base_frequency == hertz){
            if (index > 0){
                if (prev_frequency == base_frequency){
                    let recompute_hertz = hertz_list[index + 2];
                    if (_.isNil(recompute_hertz)){
                        prev_frequency = base_frequency;
                        divider -= 1;
                    } else {
                        prev_frequency = hertz_list[index - 2];
                    }
                    
                } else {
                    prev_frequency = hertz_list[index - 1];
                }
            } else {
                prev_frequency = base_frequency;
                divider -= 1;
            }

            if (index < hertz_list.length - 1){
                if (next_frequency == base_frequency){
                    let recompute_hertz = hertz_list[index + 2];
                    if (_.isNil(recompute_hertz)){
                        next_frequency = base_frequency;
                        divider -= 1;
                    } else {
                        next_frequency = hertz_list[index + 2];
                    }
                } else {
                    next_frequency = hertz_list[index + 1];
                }
            } else {
                next_frequency = base_frequency;
                divider -= 1;
            }
        }
    })

    let next_difference = Math.abs(base_frequency - next_frequency);
    let prev_difference = Math.abs(base_frequency - prev_frequency);
    
    let return_value = (next_difference + prev_difference) / (divider*1.5);
    return return_value
}

export const generateNote = function(count = 0, callback){
    let notes_list = [...this.state.notes_list];
    let notes_pool = this.state.notes_pool.filter(p=>(p.active == true));
    if (notes_pool.length > 1){
        while(count > 0){
            if (this.state.exercise_type == "random"){
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
            } else if (this.state.exercise_type == "scales") {
                let seed_index = 0;
                if (_.isNil(this.scale_direction)){this.scale_direction = 1};
                if (!_.isEmptyArray(notes_list)){
                    let note_last = notes_list[notes_list.length - 1]

                    notes_pool.forEach((item, index)=>{
                        if (item.name == note_last.name && item.octave == note_last.octave){
                            seed_index = index + this.scale_direction
                        }
                    })
                }

                if (seed_index > notes_pool.length - 1){
                    seed_index = notes_pool.length - 1;
                    this.scale_direction = -1;
                }

                if (seed_index < 0){
                    seed_index = 0;
                    this.scale_direction = 1;
                }
                notes_list.push( notes_pool[seed_index] )
            }
            
            count--
        }
    }

    this.setState({notes_list}, ()=>{
        if (!_.isNil(callback) && _.isFunction(callback)){callback()}
    });
}

export const validateNote = function(note, onCorrect, onMistake){
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
            this.note_target.push(note[this.state.noise_filter]);
            this.readNote(note, onCorrect, onMistake)
        }
    }
}

export const readNote = function(note, onCorrect, onMistake){
    this.is_listening = 10;

    let sharps_list = ScaleList[this.state.key_signature_name];
    let required_note = this.state.notes_list[this.state.notes_index];
    let required_name = required_note.name;
    let required_perfect = required_note.perfect[0];

    let is_sharp = sharps_list.includes(required_name);
    
    if (is_sharp){
        required_perfect = required_note.perfect[1];
        if (this.state.key_signature_value <= 7){
            switch(required_name){
                case "E": required_name = "F"; break;
                case "B": required_name = "C"; break;
                default: required_name += "♯"; break;
            }
        } else {
            switch(required_name){
                case "B": required_name = "A♯"; break;
                case "E": required_name = "D♯"; break;
                case "A": required_name = "G♯"; break;
                case "D": required_name = "C♯"; break;
            }
        }
    }

    let frequency_difference = Math.abs(required_perfect - note.frequency);

    if (_.isNil(this.note_current.precision_base)){
        this.note_current.precision_base = this.getPrecisionBase(required_note, is_sharp)
    }
    
    if (note.name == required_name && frequency_difference < this.note_current.precision_base){
        this.note_current.correct += 1;
        this.note_current.rating.push(frequency_difference);

        if (this.note_current.correct >= this.note_current.correct_max){  
            onCorrect(note);
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
                onMistake(note)
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

const DefaultExport =  function(){
    this.getPrecisionBase = getPrecisionBase.bind(this);
    this.generateNote = generateNote.bind(this);
    this.validateNote = validateNote.bind(this);
    this.readNote = readNote.bind(this);

    return {
        getPrecisionBase,
        generateNote,
        validateNote,
        readNote,
    }
}

export default DefaultExport