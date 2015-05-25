(function(socketController){
	var data= require("../data");
	var http = require('http');
//var io = require('socket.io')(http);
	
	socketController.initialize=function(app){
		app.get("/socket", function(req,res){
				res.render('socket1');
				//res.render("./socket1",{title:"Login"});
				
		});
		
	}
})(module.exports);