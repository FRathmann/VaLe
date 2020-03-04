// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform ,$rootScope,$location,$timeout,$ionicHistory) {

$rootScope.service=[{id:"1",img:"img/s1.png",title:"Battery and engine restore"},{id:"2",img:"img/s2.png",title:"Car liquids replacement"},{id:"3",img:"img/s3.png",title:"Speed and engine testing"},{id:"4",img:"img/s4.png",title:"Electric car loading"}]	
$rootScope.blog=[{id:"1",img:"img/b1.png"},{id:"2",img:"img/b2.png"}]
$rootScope.items=[{id:"1",img:"img/m1.png",title:"John Doe Adel"},{id:"2",img:"img/m3.png",title:"Jonathan Doe"},{id:"3",img:"img/m4.png",title:"Adam Jonathan"},{id:"4",img:"img/m2.png",title:"Adam Jonathan"},{id:"5",img:"img/m1.png",title:"Adam Jonathan"},{id:"6",img:"img/m2.png",title:"Adam Jonathan"}]
	
$rootScope.activeItemMenu=function(index){
	   $rootScope.activeMenu=index;
	}
	
   $rootScope.myGoBack = function() {$ionicHistory.goBack(); };

 $ionicPlatform.ready(function() {
        if (window.StatusBar)    StatusBar.styleDefault();
        $timeout(function(){
             if(navigator.splashscreen)  navigator.splashscreen.hide();   
        },3000);
      });


})

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
    $ionicConfigProvider.backButton.text('').previousTitleText('')  ;
    $ionicConfigProvider.views.transition("none");
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  
  .state('app.team', {
    url: "/team",
    views: {
      'menuContent': {
        templateUrl: "templates/team.html"
      }
    }
  })
  
   .state('app.contact', {
    url: "/contact",
    views: {
      'menuContent': {
        templateUrl: "templates/contact.html"
      }
    }
  })
  
  
  .state('app.detail', {
    url: "/detail",
    views: {
      'menuContent': {
        templateUrl: "templates/detail.html"
      }
    }
  })
  
   .state('app.blog', {
    url: "/blog",
    views: {
      'menuContent': {
        templateUrl: "templates/blog.html"
      }
    }
  })
  
  
   .state('login', {
    url: "/login",
        templateUrl: "templates/login.html"
  })
  
   .state('register', {
    url: "/register",
        templateUrl: "templates/register.html"
  })

  .state('app.services', {
    url: "/services",
    views: {
      'menuContent': {
        templateUrl: "templates/services.html"
      }
    }
  })
    .state('app.dashboard', {
      url: "/dashboard",
      views: {
        'menuContent': {
          templateUrl: "templates/dashboard.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })
	.state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html'
        }
      }
    })

 
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
