let note_list = [
    {name: "G", octave: 3, string: "G"},
    {name: "A", octave: 3, string: "G"},
    {name: "B", octave: 3, string: "G"},
    {name: "C", octave: 4, string: "G"},

    {name: "D", octave: 4, string: "D"},
    {name: "E", octave: 4, string: "D"},
    {name: "F", octave: 4, string: "D"},
    {name: "G", octave: 4, string: "D"},

    {name: "A", octave: 4, string: "A"},
    {name: "B", octave: 4, string: "A"},
    {name: "C", octave: 5, string: "A"},
    {name: "D", octave: 5, string: "A"},

    {name: "E", octave: 5, string: "E"},
    {name: "F", octave: 5, string: "E"},
    {name: "G", octave: 5, string: "E"},
    {name: "A", octave: 5, string: "E"},

    {name: "B", octave: 5, string: "E"},

    {name: "C", octave: 6, string: "B"},
    {name: "D", octave: 6, string: "B"},
    {name: "E", octave: 6, string: "B"},

    {name: "F", octave: 6, string: "B"},
]

let return_list = note_list.reverse().map((note, index)=>{
   
    return {...note, position: index*25, active: true}
})

return_list.reverse();

export default return_list;