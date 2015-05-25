(function(loginController){
	var data= require("../data");
	var query = require("querystring");
	var passport = require('passport');
	var http = require("http");
	
	//var $= require("jquery");
	var fs = require("fs");
	var jsdom = require("jsdom");
	var request = require("request");
	var jquery = fs.readFileSync("./public/js/jquery-2.1.1.min.js").toString();
	var window = jsdom.jsdom().parentWindow;
	var LocalStrategy = require('passport-local').Strategy;
	var postObj = {};
	
	passport.use(new LocalStrategy(
		function(done){return {user:{username:"e", password:"ee"}}}
	  /*function(username, password, done) {
		data.getUser(username, password, function(err, user){
		
			if(err){console.log("error while authenticating user");
				return done(err);
			}
			return done(null, user);
		});
	  }*/
	  
	));
	loginController.initialize = function(app){
			app.get("/login", function(req,res){
				res.render("./login",{title:"Login"});
			
			app.post('/loginProceess',function (req, res) {
			// req.user is now defined
			 //console.log(req.body);
			 var sess= req.session
			 data.getUser(req.body.data, function(err,user){
				if(err){console.log("error while authenticating user");
						sess.user=null;
						res.send(null);
				}
				//res.render("./main", {title:user.username});
				if(user==null) {
					sess.user=null;
					res.send(null);
				}else{
				sess.user = user.username;
				res.send(user);
				}
			 });
			 //res.send('ok');
			});
			
			
			app.get('/loginProceess',function(req,res){
				console.log(req.body.data);
				data.getUser(req.body.data, function(err,user){
					if(err){console.log("error while authenticating user");
						return done(err, null);
					}
					return done(null, user);
				});
			});
			
			
			app.post('/signup', function(req,res){
				data.addNewUser(req.body.data, function(err,user){
					if(err){console.log("error while registering new user");
						res.send(null);
					}
					res.send(req.body.data);
					res.end();
				});
			});
			
			
			function liveTvCallback(){
				var str = '';
				jsdom.env({
			  html: 'http://livetv.sx/en/allupcomingsports/27',
			  src: [
				jquery
			  ],
			  done: function(errors, window) {
				var $ = window.$;
				$('td').each(function(){
				  console.log( $(this).attr('href') );
				});
			  }
			});
			  //another chunk of data has been recieved, so append it to `str`
			  /* response.on('data', function (chunk) {
				str += chunk;
			  });
			   response.on('end', function () {
			   var l = $(str).find("td").text();
				console.log(l);
			  }); */
			}
		});
		
		
	}
	
})(module.exports);