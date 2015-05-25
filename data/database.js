(function(database){
	var mongodb = require("mongodb");
	var mongoUrl = "mongodb://localhost:27017/eventsdb/";
	var theDb= null;
	var BSON = mongodb.BSONPure;
	database.getDb = function(next){
		if(!theDb){
			mongodb.MongoClient.connect(mongoUrl, function(err,db){
				if(err){
					next(err, null);
				}else{
					theDb ={db:db,
						events:db.collection("events"), 
						users:db.collection("users"),
						userVotes:db.collection("userVotes"),
						bson:BSON
					};
					next(null, theDb);
				}
			})

		}else{
			next(null, theDb);
		}
	}
})(module.exports);