let note_list = [
    {name: "G", octave: 3, string: "G", perfect: [196.00, 207.65]},
    {name: "A", octave: 3, string: "G", perfect: [220.00, 233.08]},
    {name: "B", octave: 3, string: "G", perfect: [246.94, 261.63]},
    {name: "C", octave: 4, string: "G", perfect: [261.63, 277.18]},

    {name: "D", octave: 4, string: "D", perfect: [293.66, 311.13]},
    {name: "E", octave: 4, string: "D", perfect: [329.63, 349.23]},
    {name: "F", octave: 4, string: "D", perfect: [349.23, 369.99]},
    {name: "G", octave: 4, string: "D", perfect: [392.00, 415.30]},

    {name: "A", octave: 4, string: "A", perfect: [440.00, 466.16]},
    {name: "B", octave: 4, string: "A", perfect: [493.88, 523.25]},
    {name: "C", octave: 5, string: "A", perfect: [523.25, 554.37]},
    {name: "D", octave: 5, string: "A", perfect: [587.33, 622.25]},

    {name: "E", octave: 5, string: "E", perfect: [659.25, 698.46]},
    {name: "F", octave: 5, string: "E", perfect: [698.46, 739.99]},
    {name: "G", octave: 5, string: "E", perfect: [783.99, 830.61]},
    {name: "A", octave: 5, string: "E", perfect: [880.00, 932.33]},

    {name: "B", octave: 5, string: "E", perfect: [987.77, 1046.50]},

    {name: "C", octave: 6, string: "B", perfect: [1046.50, 1108.73]},
    {name: "D", octave: 6, string: "B", perfect: [1174.66, 1244.51]},
    {name: "E", octave: 6, string: "B", perfect: [1318.51, 1396.91]},

    {name: "F", octave: 6, string: "B", perfect: [1396.91, 1479.98]},
]

let return_list = note_list.reverse().map((note, index)=>{
    return {...note, position: index*25, active: true}
})

return_list.reverse();

export default return_list;