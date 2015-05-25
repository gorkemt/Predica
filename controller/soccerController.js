(function(soccerController){
	var data= require("../data");
	var query = require("querystring");
	var postObj = {};
	soccerController.initialize = function(app){

	    app.get("/sports/soccer", function (req, res) {
			var sess= req.session;
			if(sess.user =="" || sess.user==null){
				res.redirect("/login");
			}else{
			res.render("soccer",{title:"SOCCER LEAGUE",user:sess.user});
			}
		})

		app.get("/events", function (req, res) {
		    data.getAllEvents(function (err, results) {
		        res.render("allevents", { title: "Events1", events:results });
		    });
		});

		app.get("/mytest", function (req, res) {
			res.render("mytest", {title:"MYTEST"});
			//data.getAllEvents(function(err, results){
				//res.send({title:"MY TEST RES", events:results});
			//});
		});
		
		app.get("/soccer/:league",function(req,res){
			var sess= req.session;
			if(sess.user =="" || sess.user==null){
				res.redirect("/login");
			}else{
			res.render("soccer",{title:"SOCCER LEAGUE",user:sess.user});
			}
		});
		
		app.post("/getLeagueEvents",function(req,res){
			//console.log(req.params.league);
			var sess= req.session;
			if(sess.user =="" || sess.user==null){
				res.redirect("/login");
			}
			var l = req.body.league.toString().toUpperCase();
			data.getSportEvents(req.body,function(err,results){
					if(err){console.log("error while updating vote");}
					else{
						
						results.push({"user":sess.user});
						res.send(results);
						res.end();
						/*res.send([{ "_id" : "53f034a3591b370b053e4f85", "eventName" : "Arsenal - Crystal Palace", "team1" : "Arsenal", "team2" : "Crystal Palace", "team1win" : 0.33, "team2win" : 0.33, "draw" : 0.34, "eventStartDateTime" : { "date" : "16/08/14", "time" : "13:00:00" }, "eventCategory" : "sports", "eventSubCategory0" : "soccer","eventSubCategory1" : "EPL", "votes" : [ ] }]);*/
					
					}
				});
		});
		
		app.post("/getSoccerEvents", function(req,res){
			var sess = req.session;
			if(sess.user =="" || sess.user==null){
				res.redirect("/login");
			}
			data.getSoccerEvents(req.body, function(err, results){
				if(err) {console.log("error while getting soccer games");}
				else{
					results.push({"user":sess.user});
					res.send(results);
					res.end();
				}
			});
		});
		
		app.get("/main", function(req, res){
			var sess= req.session;
			if(sess.user =="" || sess.user==null){
				res.redirect("/login");
			}else{
				res.render("main", {title:"MYTEST"});
			}
		});
		
		app.post("/allevents", function(req, res){
			 data.getAllEvents(function(err, results){
				res.send({title:"Soccer Events", events:results});
			}); 
		
		});
		//Create post method to enter new events
		app.post("/soccerNew",function(obj){
			data.addNewEvent(obj,function(err){
				if(err){console.log("Error" + err);}
				else{
					res.render("/mytest", {title:"MYTEST"});
				}
			});
			
		});
		
		app.post("/adding", function(req,res){
			var obj = req.body;
			//res.write("sent");
			console.log(obj);
			console.log(req.data);
			res.send(201,{mydata:23});
			res.end();
		});
		
		app.post("/updateVote",function(req,res){
			var session = req.session;
			//console.log("This obj" + req.body.data.result);
			var voteData = req.body.data;
			voteData.useremail = session.user;
			console.log("VoteData:" +voteData);
			data.updateVoteReturnObject3(voteData, function(err,result){
				if(err){console.log("error while updating vote");}
				else{
					/*data.getEventById(req.body.data.Id,function(err,result){
						console.log("Myresults:" + result);
						req.session=session;
						res.send(201,result);
						res.end();
					});*/
					req.session=session;
					res.send(201,result);
					res.end();
				}
				
			});
	
		});
		
	};
})(module.exports)