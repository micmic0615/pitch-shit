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
            this.note_target.push(note[this.state.noise_filter]);
            this.readNote(note)
        }
    }
}

export const readNote = function(note){
    let sharps_list = ScaleList[this.state.key_signature_name];
    let required_note = this.state.notes_list[this.state.notes_index];
    let required_name = required_note.name;
    let required_perfect = required_note.perfect[0];

    let is_sharp = sharps_list.includes(required_name);
    
    if (is_sharp){
        required_perfect = required_note.perfect[1];
        switch(required_name){
            case "E": required_name = "F"; break;
            case "B": required_name = "C"; break;
            default: required_name += "♯"; break;
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
            onCorrect.bind(this)(note);
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
                onMistake.bind(this)(note)
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

const onCorrect = function(note){
    let accuracy_factor = 50;
    let precision_factor = 50;

    let rating_factor = 70;
    let combo_factor = 30;

    let combo_base_score = 1000/((this.state.progress_required + 1)*(this.state.progress_required/2));

    let combo = this.state.notes_index_count ? this.state.combo + 1 : 0;
    if (combo >= this.combo_max){this.combo_max = combo}

    let adjusted_precision_base = this.note_current.precision_base/2;

    let correct_ratio = (this.note_current.correct / (this.note_current.mistake + this.note_current.correct))*accuracy_factor;
    let perfect_ratio = ((adjusted_precision_base - (this.note_current.rating.reduce((a, b) => a + b, 0) / this.note_current.rating.length)) / adjusted_precision_base)*precision_factor;
    let note_percent = correct_ratio + perfect_ratio;

    let note_rating = Math.round((((note_percent*rating_factor) + (combo*combo_base_score*combo_factor))*100) / this.state.progress_required);
    let note_score = this.state.notes_index_count ? note_rating : 0;

    let notes_list = _.jsonClone([...this.state.notes_list])
    notes_list[this.state.notes_index].accuracy = this.state.notes_index_count ? Math.round(correct_ratio*100/accuracy_factor) : 0;
    notes_list[this.state.notes_index].precision = this.state.notes_index_count ? Math.round(perfect_ratio*100/precision_factor) : 0;
 

    let incremented_index = this.state.notes_index + 1;
    let notes_index_start = this.state.notes_index_start
    if (incremented_index >= this.state.notes_index_start + this.state.notes_index_range){
        notes_index_start = this.state.notes_index_start + this.state.notes_index_range
    }

    let progress_current = Math.min(this.state.progress_current + 1, this.state.progress_required);

    let running = this.state.running;
    
    this.sounds.ding.currentTime = 0
    this.sounds.ding.play()
    if (progress_current == this.state.progress_required){
        incremented_index = incremented_index - 1;
        running = 3;

        this.sounds.dingding.currentTime = 0
        this.sounds.dingding.play()
    }

    this.setState({
        notes_index: incremented_index, 
        score: Math.min(this.state.score + note_score, 1000000),
        notes_index_count: true,
        notes_index_assist: "",
        notes_index_start,
        progress_current,
        running,
        combo,
        notes_list,
    }, ()=>{
        this.note_current.correct = 0;
        this.note_current.mistake = 0;
        this.note_current.rating = [];
        this.note_current.precision_base = null;
        this.note_current.mistake_padding = this.note_current.mistake_padding_max;
    })
}

const onMistake = function(note){
    this.sounds.dong.currentTime = 0
    this.sounds.dong.play()
    this.setState({
        notes_index_count: false,
        combo: 0,
        errors: this.state.errors + 1
    });
}