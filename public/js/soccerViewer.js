(function(angular) {
	var app = angular.module("soccerViewer", []);
	
	var SoccerViewController = function($scope, $http, $location,$interval){
		$scope.cf=3;
		var absUrl = $location.$$absUrl;
		var urlVars = absUrl.split("/");
		
		var index = absUrl.lastIndexOf("/");
		
		var gameDate =new Date(); 
		var sport = urlVars[urlVars.length-2];
		var league = urlVars[urlVars.length-1].toUpperCase();//absUrl.substring(index+1).toUpperCase();
		
		var qryObj = {"sport":sport, "league":league, "year":gameDate.getFullYear(),"month":digitCheck(gameDate.getMonth()+1),"day":digitCheck(gameDate.getDate())};
		
		$http.post("/getSoccerEvents",qryObj).then(function(results){
			
			$scope.allevents= results.data.slice(0,results.data.length-1);
			$scope.user = results.data[results.data.length-1].user;
			
			//$scope.title = results.data.eventName;
			$scope.allevents.forEach(function(eachEvt){
				if(eachEvt.user!=null) return;
				var totalVotes=eachEvt.votes.length;
				var team1win=0;
				var team2win=0;
				if(totalVotes==0) {
					team1win=1;team2win=1;
					totalVotes=2;
				}
				eachEvt.votes.forEach(function(vote){
					if(vote.result==1){
						team1win++;
					}else if(vote.result==2){
						team2win++;
					}
				});
				eachEvt.team1win = parseFloat(team1win/totalVotes)*100;
				eachEvt.team2win = parseFloat(team2win/totalVotes)*100;
				eachEvt.totalVotes = totalVotes;
			});
			
		})
		
		
		$scope.RunAnimation=function(){
			
			$('[id^="xt_1_"]').each(function(item){
				var val= $(this).find('span').text()*3;
				$(this).animate({width:val+"px"}, 3000);
			});
			$('[id^="xt_2_"]').each(function(item){
				var val= $(this).find('span').text()*3;
				$(this).animate({width:val+"px"}, 3000);
			});
			
		};
		
		
		$scope.updateVote=function(team,evtid){
			$http.post("/updateVote/",{data:{result:team,Id:evtid}}).
			success(function(data,status, headers,config){
				writeResults(data);
			}).
			error(function(data,status,headers,config){
			});
		}
		
		var voteResults = function(data){
			var firstdata = data[0];
			var totalVotes = data.length;
			console.log("totalVotes:" + totalVotes);
			var team1win=0;
			var team2win=0;
			var voteWho1="";
			var voteWho2="";
			data.forEach(function(voteResult){
				if(voteResult.vote==1){
					if(voteResult.useremail==$scope.user)voteWho1="Voted";
					team1win++;
				}else if(voteResult.vote==2){
					if(voteResult.useremail==$scope.user)voteWho2="Voted";
					team2win++;
				}
			});
			var team1percent = (team1win/totalVotes)*100;
			var team2percent = (team2win/totalVotes)*100;
			$('#team1win_'+ firstdata.eventId).find('span').text(team1percent.toFixed(2)+voteWho1);
			$('#team2win_'+ firstdata.eventId).find('span').text(team2percent.toFixed(2)+voteWho2);
			$('#xt_1_'+ firstdata.eventId).animate({width:($scope.cf*team1percent)+"px"},1000);
			$('#xt_2_'+ firstdata.eventId).animate({width:($scope.cf*team2percent)+"px"},1000);
			$('#totalVotes_' + firstdata.eventId).find('span').text("Total Votes:" + totalVotes);
		}
		
		var writeResults = function(data){
			var firstdata = data[0];
				console.log("First data:" + firstdata);
				console.log(data);
				var totalVotes = firstdata.votes.length;
				var team1win=0;
				var team2win=0;
				var voteWho1="";
				var voteWho2="";
				//console.log(data.useremail);
				firstdata.votes.forEach(function(vote){
				
					if(vote.result==1){
						if(vote.useremail==$scope.user)voteWho1="Voted";
						team1win++;
					}else if(vote.result==2){
						if(vote.useremail==$scope.user)voteWho2="Voted";
						team2win++;
					}
				});
				var team1percent = (team1win/totalVotes)*100;
				var team2percent = (team2win/totalVotes)*100;
				$('#team1win_'+ firstdata._id).find('span').text(team1percent.toFixed(2)+voteWho1);
				$('#team2win_'+ firstdata._id).find('span').text(team2percent.toFixed(2)+voteWho2);
				$('#xt_1_'+ firstdata._id).animate({width:($scope.cf*team1percent)+"px"},1000);
				$('#xt_2_'+ firstdata._id).animate({width:($scope.cf*team2percent)+"px"},1000);
				$('#totalVotes_' + firstdata._id).find('span').text("Total Votes:" + totalVotes);
		}
		
		$scope.updateWinPercent=function(id,percent){
			$('#'+id).animate({width:percent+"px"},1000);
		}
		
		$scope.voteTimer = function(id, currentVoteCount){
			var totalVotes = $("#totalVotes_"+id).find("span")[1].firstChild.data;
		}
		
		
	};
	
	var digitCheck = function(val){
		if(val<10){
			return "0" + val;
		}else{
			return val;
		}
	};
	app.controller("SoccerViewController",["$scope","$http", "$location", "$interval", SoccerViewController]);
	
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
	
}(window.angular));