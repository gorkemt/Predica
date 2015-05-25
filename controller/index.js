(function(controller){
	
	controller.initializeControllers= function(app){
		var soccerController= require("./soccerController");
		var loginController= require("./loginController");
		var userController = require("./userController");
		var eventsUpdaterController = require("./eventsUpdaterController");
		var socketController = require("./socketController");
		
		soccerController.initialize(app);
		loginController.initialize(app);
		userController.initialize(app);
		eventsUpdaterController.initialize(app);
		socketController.initialize(app);
	}
	
})(module.exports)