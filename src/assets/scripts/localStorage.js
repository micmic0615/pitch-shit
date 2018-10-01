export function setStateAndSave(state){
    this.setState(state, ()=>{
        Object.keys(state).forEach((key)=>{
            let save_value = (_.isArray(state[key]) || _.isObject(state[key])) ? JSON.stringify(state[key]) : state[key];
            let save_suffix =  (_.isArray(state[key]) || _.isObject(state[key])) ? "_json" : "";
            localStorage.setItem(process.env.LOCALSTORAGE_KEY + "_" + key + save_suffix, save_value)
        })
    })
}

export function getStateFromLocalStorage(state){
    let return_state = {};
    Object.keys(state).forEach((key)=>{
        let local_storage_value = localStorage.getItem(process.env.LOCALSTORAGE_KEY + "_" + key) || JSON.parse(localStorage.getItem(process.env.LOCALSTORAGE_KEY + "_" + key + "_json"))

        return_state[key] = local_storage_value || state[key]
    })

    return return_state;
}