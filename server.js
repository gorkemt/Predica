var http = require("http");
var express = require("express");
var bodyParser= require('body-parser');
var cookieParser=require('cookie-parser');
var controller = require("./controller");
var flash = require('connect-flash');
var session=require('express-session');
var passport = require("passport");
var app = express();

app.set("view engine", "vash");

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(cookieParser('milestone111'));
app.use(session({ cookie: { maxAge: 300000, secure:false, httpOnly:true }, name:"eventsCookie",genid:function(req){return "1234"}}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

controller.initializeControllers(app);

var server = http.createServer(app);
 
var io = require('socket.io').listen(server);
io.on('connection', function(socket){
			setInterval(function(){
        socket.emit('date', {'date': new Date()});
    }, 5000);
			console.log('a user connected');
	socket.on('client_data', function(data){
		process.stdout.write(data.letter);
		socket.emit('userInfo',{'info':data.letter});
	});
	
	
});

server.listen(4000);