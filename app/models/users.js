(function(){'use strict';
	const mongoose = require('mongoose');
	const schema = mongoose.Schema;

	const UserSchema = new schema({
		first_name: { 
			type: String,
			default: 'unknown'
		},

		last_name: { 
			type: String,
			default: 'unknown'
		},

		email: { 
			type: String,
			default: 'unknown'
		},

		occupation: { 
			type: String,
			default: 'unknown'
		},
		// name: { 
		// 	type: String,
		// 	default: 'unknown'
		// },

		// real_name: { 
		// 	type: String,
		// 	default: 'unknown'
		// },

		// email: { 
		// 	type: String,
		// 	default: 'unknown@email.com'
		// },

		// slack_id: { 
		// 	type: String,
		// 	default: "00000000"
		// },

		// convo: {
		// 	type: Object,
		// 	default: {
		// 		actions: [],
		// 		params: {},
		// 		last_message: "",
		// 	},

		// 	actions: { 
		// 		type: Array,
		// 		default: []
		// 	},

		// 	params: { 
		// 		type: Object,
		// 		default: {}
		// 	},

		// 	last_message: {
		// 		type: String,
		// 		default: "",
		// 	}
		// },

		// permissions: { 
		// 	type: Array,
		// 	default: []
		// },

		// payslips: {
		// 	type: Array,
		// 	default: []
		// },

		// _create: {
		// 	type: Object
		// }
	});

	let Users = mongoose.model('Users', UserSchema);

	module.exports = Users;
}())