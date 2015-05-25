(function(data){
    var seedData = require("./seedData");
    var database = require("./database");
    
	data.getNoteCategories=function(someFunc){
		someFunc(null,seedData.initialEvents);
	};
	
	data.getAllEvents = function (next) {
	    database.getDb(function (err, db) {
	        if (err) {
	            next(err, null);
	        } else {
	            db.events.find().toArray(function (err, results) {
	                if (err) {
	                    next(err, null);
	                } else {
	                    next(null, results);
	                }
                    
	            });
	        }
	    });
	};
	
	
	data.getSportEvents=function(qryObj, next){
		database.getDb(function(err,db){
			if(err){
				next(err,null);
			}else{
				db.events.find({"eventCategory":"sports", "eventSubCategory0":qryObj.sport, "eventSubCategory1":qryObj.league,
				'eventStartDateTime.dateTime':{"$gte": new Date(qryObj.year+"-" + qryObj.month+"-"+ qryObj.day + "T00:00:00Z"), "$lt": new Date(qryObj.year+"-" + qryObj.month+"-"+ qryObj.day + "T23:59:59Z")}}).toArray(function(err, results){
					if(err){
						next(err,null);
					}else{
						next(null, results);
					}
				});
			}
		});
	}
	
	data.getSoccerEvents= function(qryObj,next){
		database.getDb(function(err,db){
			if(err){
				next(err,null);
			}else{
				db.events.find({"eventCategory":"sports", "eventSubCategory0":"soccer",
				'eventStartDateTime.dateTime':{"$gte": new Date(qryObj.year+"-" + qryObj.month+"-"+ qryObj.day + "T00:00:00Z")/*, "$lt": new Date(qryObj.year+"-" + qryObj.month+"-"+ qryObj.day + "T23:59:59Z")*/}}).toArray(function(err, results){
					if(err){
						next(err,null);
					}else{
						for(var i=0;i<results.length;i++){
							console.log("eventId" + results[i]._id);
							db.userVotes.find({"eventId":"\""+results[i]._id+"\""}).toArray(function(err,res){
								if(err){console.log("Error occurred");}
								else{
									//console.log("Votes:" + res);
									results[i].votes = res;
								}
							});
						}
						
						next(null, results);
					}
				});
				
			}
		});
	}
	
	data.getEventById = function (eventId, next) {
	    database.getDb(function (err, db) {
	        if (err) {
	            next(err, null);
	        } else {
				var o_id = new db.bson.ObjectID(eventId);
	            db.events.find({_id:o_id}).toArray(function (err, results) {
	                if (err) {
	                
					next(err, null);
	                } else {
	                    next(null, results);
	                }
                    
	            });
	        }
	    });
	};
	
	data.addNewEvent= function(eventToInsert, next){
		database.getDb(function(err, db){
			if(err){
				next(err, null);
			}
			else{
				db.events.insert(eventToInsert,function(err){
				if(err)console.log("Failed"+err);
				});
			}
		});
	};
	
	data.updateVote=function(eventToUpdate,next){
		console.log(eventToUpdate);
		database.getDb(function(err,db){
			if(err){
				next(err,null);
			}else{
				var o_id = new db.bson.ObjectID(eventToUpdate.Id);
				db.events.find({$and:[{votes:{$elemMatch:{useremail:eventToUpdate.useremail}}},{_id:o_id}]})
				.toArray(function(err,results){
					if(err)throw err;
					if(results.length==0){
						db.events.update({_id: o_id},
						{$push:{votes:{result:eventToUpdate.result, useremail:"b@b.com"}}},
							function(err, result){
								if(err) throw err;
								console.log(result);
							}
						);
					}
				});
				
			}
		});
	}

	data.updateVoteReturnObject= function(eventToUpdate, next){
		database.getDb(function(err,db){
			if(err){
				next(err,null);
			}else{
				var o_id = new db.bson.ObjectID(eventToUpdate.Id);
				db.events.find({$and:[{votes:{$elemMatch:{useremail:eventToUpdate.useremail}}},{_id:o_id}]}).toArray(
					function(err,results){
						if(err){next(err,null);}
						//if(results.length==0){
							db.events.update({_id: o_id},
							{$push:{votes:{result:eventToUpdate.result, useremail:eventToUpdate.useremail}}},{upsert:true},
								function(err, result){
									if(err) throw err;
									db.events.find({_id:o_id}).toArray(function (err, results) {
										if (err) {
											next(err, null);
										} else {
											
											next(null, results);
										}
										
									});
								}
							);
						/*}else{
							next(null, results);
						}*/
					});
			}
		});
	}
	
	
	data.updateVoteReturnObject3= function(eventToUpdate, next){
		database.getDb(function(err,db){
			if(err){
				next(err,null);
			}else{
				var o_id = new db.bson.ObjectID(eventToUpdate.Id);
				db.events.find({"_id":o_id, "votes.useremail":eventToUpdate.useremail}).toArray(
					function(err,results){
						if(err){next(err,null);}
						if(results.length==0){
							db.userVotes.update({"eventId":eventToUpdate.Id, "useremail":eventToUpdate.useremail},
							{"eventId":eventToUpdate.Id, "useremail":eventToUpdate.useremail,"vote":eventToUpdate.result}
							,{upsert:true}, function(err, c){
								db.events.update({_id: o_id},
								{$push:{votes:{result:eventToUpdate.result, useremail:eventToUpdate.useremail}}},{upsert:true},
									function(err, result){
										if(err) throw err;
										db.events.find({_id:o_id}).toArray(function (err, results) {
											if (err) {
												next(err, null);
											} else {
												
												next(null, results);
											}
											
										});
									}
								);
							});
						}else if(results.length==1){
							db.userVotes.update({"eventId":eventToUpdate.Id, "useremail":eventToUpdate.useremail},
							{"eventId":eventToUpdate.Id, "useremail":eventToUpdate.useremail,"vote":eventToUpdate.result}
							,{upsert:true}, function(err,c){
								var s = results[0];
								for(var i=0;i<s.votes.length;i++){
									if(s.votes[i].useremail == eventToUpdate.useremail){
										s.votes[i].result = eventToUpdate.result;
										break;
									}
								}
								next(null, results);
							});
						}
						else{
							next(null, results);
						}
					});
			}
		});
	}
	data.updateVoteReturnObject2= function(eventToUpdate, next){
		database.getDb(function(err,db){
			if(err){
				next(err,null);
			}else{
				var o_id = new db.bson.ObjectID(eventToUpdate.Id);
				console.log(eventToUpdate.useremail);
				db.userVotes.find({"$and":[{"useremail":eventToUpdate.useremail},{"eventId":eventToUpdate.Id}]}).toArray(
					function(err,results){
						if(err){next(err,null);}
						if(results.length==0){
							db.userVotes.update({"eventId":eventToUpdate.Id, "useremail":eventToUpdate.useremail},{"eventId": eventToUpdate.Id,"vote":eventToUpdate.result, "useremail":eventToUpdate.useremail},{upsert:true},
								function(err, result){
									if(err) throw err;
									db.userVotes.find({"eventId":eventToUpdate.Id}).toArray(function (err, results) {
										if (err) {
											next(err, null);
										} else {
											
											next(null, results);
										}
										
									});
								}
							);
						}else{
							db.userVotes.update({"eventId":eventToUpdate.Id, "useremail":eventToUpdate.useremail},{"eventId": eventToUpdate.Id,"vote":eventToUpdate.result, "useremail":eventToUpdate.useremail},{upsert:true},
								function(err, result){
									if(err) throw err;
									db.userVotes.find({"eventId":eventToUpdate.Id}).toArray(function (err, results) {
										if (err) {
											next(err, null);
										} else {
											
											next(null, results);
										}
										
									});
								}
							);
						}
					});
			}
		});
	}
	
	
	data.getUser= function(user, next){
		database.getDb(function (err, db) {
			if (err) {
	            next(err, null);
	        } else {
				db.users.find({username:user.username, password:user.password}).toArray(function(err,results){
					if(err){
						next(err,null);
					}else{
						if(results.length>0){
							next(null, results[0]);
						}else{
							next(null,null);
						}
					}
				});
			}
		});
	}
	
	data.addNewUser=function(user, next){
		database.getDb(function(err, db){
			if(err){
				next(err, null);
			}
			else{
				db.users.insert(user,function(err){
				if(err)console.log("Failed"+err);
				
					next(null,user);
				});
			}
		});
	}
	
	data.getUserVotes = function (qryObj, next) {
	    database.getDb(function (err, db) {
	        if (err) {
	            next(err, null);
	        } else {
	            db.events.find({"eventCategory":"sports", "eventSubCategory0":"soccer","userId":"","eventId":"",
				'voteDateTime':{"$gte": new Date(qryObj.year+"-" + qryObj.month+"-"+ qryObj.day + "T00:00:00Z"), "$lt": new Date(qryObj.year+"-" + qryObj.month+"-"+ qryObj.day + "T23:59:59Z")}}).toArray(function (err, results) {
	                if (err) {
	                    next(err, null);
	                } else {
	                    next(null, results);
	                }
                    
	            });
	        }
	    });
	};
	
	var addGeneric= function(collection, item,next){
		database.getDb(function(err, db){
			if(err){
				next(err, null);
			}
			else{
				collection.insert(item,function(err){
				if(err)console.log("Failed"+err);
				});
			}
		});
	}
	
	
})(module.exports);