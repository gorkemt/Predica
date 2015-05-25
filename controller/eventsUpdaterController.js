(function(eventsUpdaterController){
	var data= require("../data");
	var http = require("http");
	var fs = require("fs");
	var jsdom = require("jsdom");
	var request = require("request");
	var jquery = fs.readFileSync("./public/js/jquery-2.1.1.min.js").toString();
	var parseString = require('xml2js').parseString;
	var window = jsdom.jsdom().parentWindow;
	
	eventsUpdaterController.initialize = function(app){
		app.get('/newEvents/:leagueName/:date', function(req, res){
				var dt = req.param("date")
				var leagueName= req.param("leagueName");
				request({ uri:'http://scores.nbcsports.com/'+leagueName +'/scoreboard_daily.asp?gameday='+dt }, function (error, response, body) {  
				  if (error && response.statusCode !== 200) {
					console.log('Error when connecting nbcsports.com')
				 }
				 
				 jsdom.env({
					html: body,
					scripts: [
					  'http://code.jquery.com/jquery-1.5.min.js'
					]
				  , done: function (err, window) {
					var $ = window.jQuery;

					
					//$("td[id^='event_']");
					
					
					var titleRow = $('.shsTableTtlRow');
					for(var k=0;k<titleRow.length;k++){
						var homeTeam = titleRow[k].nextSibling.childNodes[1].childNodes[1].innerHTML;
						var awayTeam=titleRow[k].nextSibling.childNodes[5].childNodes[1].innerHTML;
						var eventTime = titleRow[k].childNodes[1].childNodes[4].innerHTML;
						var timePart = eventTime.substr(0, eventTime.indexOf(" "));
						var hourPart = timePart.substr(0,timePart.indexOf(":"))
						var secondsPart = timePart.substr(timePart.indexOf(":")+1,2);
						var mDateTime = new Date(parseInt(dt.substr(0,4)), parseInt(dt.substr(4,2))-1,parseInt(dt.substr(6,2)), parseInt(hourPart)-5,0,0,0);
						console.log(hourPart);
						var obj = { "eventName" :homeTeam + " - "+ awayTeam, "team1" : homeTeam, "team2" : awayTeam, "team1win" : 0.33, "team2win" : 0.33, "draw" : 0.34, "eventStartDateTime" : { "date" : dt, "time" : eventTime, "dateTime":mDateTime }, "eventCategory" : "sports", "eventSubCategory0" : "soccer",
						 "eventSubCategory1" : leagueName.toUpperCase(), "votes" : [ ] };
						data.addNewEvent(obj,function(err){
							if(err){console.log("Error" + err);}
							
						});
					}
					//console.log(events.length);
					res.end();
					}
				  });
				//http.get('http://livetv.sx/en/allupcomingsports/1', liveTvCallback).end();
				//liveTvCallback();
				});
			});
			
		app.get('/newLivescoreEvents', function(req, res){
			//'http://code.jquery.com/jquery-2.1.1.min.js'
			request({ uri:'http://livetv.sx/en/allupcomingsports/1/' }, function (error, response, body) { 
				if (error && response.statusCode !== 200) {
					console.log('Error when connecting livetv.ru')
				}
				jsdom.env({
					html: body,
					scripts: [
						'http://code.jquery.com/jquery-1.5.min.js' //'../public/js/jquery-2.1.1.min.js' 
					]
				  , done: function (err, window) {
						if(err){console.log("there is error " + err);}
						try{
							console.log("item selection");
						var $ = window.jQuery;
						var g = $("a");
						if(g== null || g==undefined){console.log("undefined obj");}
						else{
							console.log("anch length:" + g.innerHTML);
						}
						var allevents =$("td[id^='event_']");
						console.log("all events length " + allevents.length);
						allevents.each(function(item){
							var evtNames = $(this).find('.live').html();
							console.log(evtNames);
							var evtNamesList = evtNames.split("–");
							var homeTeam = evtNamesList[0];
							var awayTeam= evtNamesList[1];
							var evtDesc = $(this).find('.evdesc').html();
							var evtDescList = evtDesc.split("<br>");
							var dayMonth = evtDescList[0].substr(0,evtDescList[0].indexOf("at")-1).trim();
							var day = parseInt(dayMonth.substr(0, dayMonth.indexOf(" ")).trim());
							var month = parseInt(findMonth(dayMonth.substring(dayMonth.indexOf(" ")).trim()));
							var eventTime = evtDescList[0].substring(evtDescList[0].indexOf("at")+2).trim();
							var tempDate = new Date();
							var leagueName =evtDescList[1].substr(1,evtDescList[1].length-2); 
							var currentYear = tempDate.getFullYear();
							var eventDate = month + "/" + day + "/" + currentYear;
							var mDateTime = new Date(currentYear, month, day,10,0,0,0);
							
							var obj = { "eventName" :homeTeam + " - "+ awayTeam, "team1" : homeTeam.trim(), "team2" : awayTeam, "team1win" : 0.33, "team2win" : 0.33, "draw" : 0.34, "eventStartDateTime" : { "date" : eventDate, "time" : eventTime, "dateTime":mDateTime }, "eventCategory" : "sports", "eventSubCategory0" : "soccer",
							"eventSubCategory1" : leagueName, "votes" : [ ] };
							data.addNewEvent(obj,function(err){
								if(err){console.log("Error" + err);}
								
							});
						});
						}catch(err){
							console.log("error:" + err.message);
							res.end();
						}
						res.end();
					}
				});
			}); 	
		});
		
		app.get('/rss',function(req,res){
			var xml = "<root>Hello xml2js!</root>"
			parseString(xml, function (err, result) {
				console.dir(result);
			});
		});
		var findMonth = function(monthName){
			switch(monthName){
				case "January":
				case "january":
					return 0;
					break;
				case "February":
				case "february":
					return 1;
					break;
				case "March":
				case "march":
					return 2;
					break;
				case "April":
				case "april":
					return 3;
					break;
				case "May":
				case "may":
					return 4;
					break;
				case "June":
				case "june":
					return 5;
					break;
				case "July":
				case "july":
					return 6;
					break;
				case "August":
				case "august":
					return 7;
					break;
				case "September":
				case "september":
					return 8;
					break;
				case "October":
				case "october":
					return 9;
					break;
				case "November":
				case "november":
					return 10;
					break;
				case "December":
				case "december":
					return 11;
					break;
				}
				
			}
		
	}
	
})(module.exports);