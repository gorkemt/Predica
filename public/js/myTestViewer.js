(function(angular) {
	var app = angular.module("myTestViewer", []);
	
	var TestViewController = function($scope,$http){
		 $scope.cf=3;
		 $http.post("/allevents").then(function(results){
			$scope.allevents= results.data.events;
			$scope.title = results.data.title;
		});
		$scope.RunAnimation=function(){
			console.log("repeat done");
			$('[id^="xt_1_"]').each(function(item){
				var val= $(this).find('span').text()*3;
				//alert(val);
				$(this).animate({width:val+"px"}, 3000);
			});
			$('[id^="xt_2_"]').each(function(item){
				var val= $(this).find('span').text()*3;
				//alert(val);
				$(this).animate({width:val+"px"}, 3000);
			});
		}
		
		$scope.updateEvent=function(evt){
			$http.post("/adding/",{data:{title:"hello"}}).
			success(function(data, status, headers, config) {
			$('#team1win_1').find('span').text(data.mydata);
			
			  // this callback will be called asynchronously
			  // when the response is available
			}).
			error(function(data, status, headers, config) {
			  // called asynchronously if an error occurs
			  // or server returns response with an error status.
			});
		}
		
		
		$scope.updateVote=function(team,evtid){
			$http.post("/updateVote/",{data:{result:team,Id:evtid}}).
			success(function(data,status, headers,config){
				var firstdata = data[0];
				console.log("First data:" + firstdata);
				console.log(data);
				var totalVotes = firstdata.votes.length;
				var team1win=0;
				var team2win=0;
				
				firstdata.votes.forEach(function(vote){
					if(vote.result==1){
						team1win++;
					}else if(vote.result==2){
						team2win++;
					}
				});
				console.log("total votes" + totalVotes);
				console.log("team1win:" + team1win);
				console.log("team2win:"+ team2win);
				var team1percent = (team1win/totalVotes)*100;
				var team2percent = (team2win/totalVotes)*100;
				$('#team1win_'+ firstdata._id).find('span').text(team1percent);
				$('#team2win_'+ firstdata._id).find('span').text(team2percent);
				$('#xt_1_'+ firstdata._id).animate({width:($scope.cf*team1percent)+"px"},1000);
				$('#xt_2_'+ firstdata._id).animate({width:($scope.cf*team2percent)+"px"},1000);
			}).
			error(function(data,status,headers,config){
			});
		}
		
		$scope.updateWinPercent=function(id,percent){
			$('#'+id).animate({width:percent+"px"},1000);
		}
	}
	app.controller("TestViewController", ["$scope","$http", TestViewController]);
	
	app.directive(
			"repeatComplete", function( $rootScope ) {

				// Because we can have multiple ng-repeat directives in
				// the same container, we need a way to differentiate
				// the different sets of elements. We'll add a unique ID
				// to each set.
				var uuid = 0;


				// I compile the DOM node before it is linked by the
				// ng-repeat directive.
				function compile( tElement, tAttributes ) {

					// Get the unique ID that we'll be using for this
					// particular instance of the directive.
					var id = ++uuid;

					// Add the unique ID so we know how to query for
					// DOM elements during the digests.
					tElement.attr( "repeat-complete-id", id );

					// Since this directive doesn't have a linking phase,
					// remove it from the DOM node.
					tElement.removeAttr( "repeat-complete" );

					// Keep track of the expression we're going to
					// invoke once the ng-repeat has finished
					// rendering.
					var completeExpression = tAttributes.repeatComplete;

					// Get the element that contains the list. We'll
					// use this element as the launch point for our
					// DOM search query.
					var parent = tElement.parent();

					// Get the scope associated with the parent - we
					// want to get as close to the ngRepeat so that our
					// watcher will automatically unbind as soon as the
					// parent scope is destroyed.
					var parentScope = ( parent.scope() || $rootScope );

					// Since we are outside of the ng-repeat directive,
					// we'll have to check the state of the DOM during
					// each $digest phase; BUT, we only need to do this
					// once, so save a referene to the un-watcher.
					var unbindWatcher = parentScope.$watch(
						function() {

							console.info( "Digest running." );

							// Now that we're in a digest, check to see
							// if there are any ngRepeat items being
							// rendered. Since we want to know when the
							// list has completed, we only need the last
							// one we can find.
							var lastItem = parent.children( "*[ repeat-complete-id = '" + id + "' ]:last" );

							// If no items have been rendered yet, stop.
							if ( ! lastItem.length ) {

								return;

							}

							// Get the local ng-repeat scope for the item.
							var itemScope = lastItem.scope();

							// If the item is the "last" item as defined
							// by the ng-repeat directive, then we know
							// that the ng-repeat directive has finished
							// rendering its list (for the first time).
							if ( itemScope.$last ) {

								// Stop watching for changes - we only
								// care about the first complete rendering.
								unbindWatcher();

								// Invoke the callback.
								itemScope.$eval( completeExpression );

							}

						}
					);

				}

				// Return the directive configuration. It's important
				// that this compiles before the ngRepeat directive
				// compiles the DOM node.
				return({
					compile: compile,
					priority: 1001,
					restrict: "A"
				});

			});
			
}(window.angular))