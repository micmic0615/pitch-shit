require('dotenv').config();
const globalFunctions = require("./globals")();
Object.keys(globalFunctions).forEach((g_func)=>{ global[g_func] = globalFunctions[g_func] });

global.DB = {};

const glob = require("glob");
let models = glob.sync("./app/models/*.js", {});
models.forEach((model_path)=>{
    let model_name = model_path.replace("./app/models/", "").replace(".js", "");
    global.DB[model_name] = require(model_path)
});

const mongoose = require('mongoose');
mongoose.connect("mongodb://"+process.env.DB_USERNAME+":"+process.env.DB_PASSWORD+"@"+process.env.DB_HOST+":"+process.env.DB_PORT+"/"+process.env.DB_NAME);

const compression = require('compression');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
// const cors = require('cors');
const passport = require( 'passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

mongoose.connection.on('open', ()=>{
	passport.serializeUser(function(user, done) {done(null, user._id)});

	passport.deserializeUser(function(id, done) {
		DB["sessions"].findOne({"_id": id}, function(err, user_session){
			if (!_.isNil(user_session)){done(null, user_session)} 
			else {done(null, false)}
		})
	});

	app.use(cookieParser());
	app.use(bodyParser.json({limit: '50mb'}));
	app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));

	app.use(session({
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			collection:"connect_sessions",
			autoRemove: 'interval',
     		autoRemoveInterval: 5,
			ttl: 3 * 24 * 60 * 60
		}), 
		secret: 'greymattercapsecretkey',		
		resave: true,
		saveUninitialized: true,
		cookie: { httpOnly: true, secure: false }
	}))

	app.use(passport.initialize());
	app.use(passport.session());
	// app.use(cors({origin: [NODE.CONFIG.FRONTEND], credentials: true }));

	app.use(compression())

	app.use(express.static(__dirname + '/src'));

	let routes = glob.sync("./app/routes/*.js", {});
	routes.forEach((route)=>{
		let rotue_details = route.replace("./app/routes/", "").split(".");

		let route_crud = rotue_details[0];
		let route_name = rotue_details[1];
		let route_function = require(route);
		app[route_crud]("/api/" + route_name, route_function)
	})

	app.get('*', function(req, res) {
		res.sendFile(path.join(__dirname + '/src/index.html'));
	});
	
	app.listen(process.env.APP_PORT);
	console.log("App running on port " + process.env.APP_PORT)
})

mongoose.connection.on('error',function (err) {  
    console.log('Mongoose default connection error: ' + err);
}); 

mongoose.connection.on('disconnected', function () {  
    console.log('Mongoose default connection disconnected'); 
});