angular.module('underscore', [])
  .factory('_', function () {
    return window._; // assumes underscore has already been loaded on the page
  });

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('jsconfuy', [
  'ionic',
  'jsconfuy.controllers',
  'jsconfuy.services',
  'jsconfuy.filters',
  'jsconfuy.directives',
  'ngMap',
  'ngStorage'
])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      var notificationOpenedCallback = function (jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      };
      android = $ionicPlatform.is("android")
      console.log(android)
      if (android) {
        window.plugins.OneSignal
          .startInit("a895716f-7649-48f6-a470-e6cf43c87eb1")
          .handleNotificationOpened(notificationOpenedCallback)
          .endInit();
      }

    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
      })

      .state('app.speakers', {
        url: "/speakers",
        views: {
          'menuContent': {
            templateUrl: "templates/speakers.html",
            controller: 'SpeakersCtrl'
          }
        }
      })
      .state('app.event', {
        url: "/event/:id",
        views: {
          'menuContent': {
            templateUrl: "templates/event.html",
            controller: 'EventCtrl'
          }
        }
      })

      .state('login', {
        url: "/login",
        //cache:false,
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl'

      })
      .state('app.editevent', {
        url: "/editevent",
        cache:false,
        views: {
          'menuContent': {
            templateUrl: "templates/editevent.html",
            controller: 'EditCtrl'
          }
        }
      })
      .state('app.program', {
        url: "/program",
        
        views: {
          'menuContent': {
            templateUrl: "templates/program.html",
            controller: 'ProgramCtrl'
          }
        }
      })
      .state('eventsel', {
        url: "/selectevent",
        templateUrl: "templates/selectevent.html",
        controller: 'EventselCtrl',
        params: {
          user: null
        }

      })

      .state('app.venue', {
        url: "/venue",
        views: {
          'menuContent': {
            templateUrl: "templates/venue.html",
            controller: 'VenueCtrl'
          }
        }
      })
      .state('signup', {
        url: "/signup",
        templateUrl: "templates/signup.html",
        controller: 'SignupCtrl'
      })
      .state('logout', {
        cache: false,
        url: "/logout/:l",
        controller: 'logoutCtrl'
      })
      .state('app.agenda', {
        cache: false,
        url: "/agenda",
        views: {
          'menuContent': {
            templateUrl: "templates/agenda.html",
            controller: 'AgendaCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  });
