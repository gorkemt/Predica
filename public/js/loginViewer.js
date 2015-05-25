(function(angular) {
	var app = angular.module("loginViewer", []);
	
	var LoginViewController = function($scope, $http, $location, $window){
		$scope.username="";
		$scope.password="";
		$scope.regEmail="";
		$scope.regPassword="";
		$scope.regPassword2="";
		$scope.login = function(){
			$http.post("/loginProceess",{data:{username:$scope.username, password:$scope.password}}).
			success(function(data, status, headers, config) {
				if(data != null && data != ""){
					$window.location.href="/main";
				}else{
					$window.location.href="/login";
				}
				//alert(data);
			}).error(function(data,status,headers, config){
				$window.location.href="/login";
			});
		}
		
		$scope.signup= function(){
			
			$http.post("/signup",{data:{username:$scope.regEmail, password:$scope.regPassword}}).
			success(function(data, status, header, config){
				
			});
			
		
		}
	}
	//scbcke233
	app.controller("LoginViewController", ["$scope","$http","$location", "$window", LoginViewController]);
	
}(window.angular))