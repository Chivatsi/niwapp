angular.module('jsconfuy.controllers', [])

  .controller('AppCtrl', function ($scope) {

  })

  .controller('SpeakersCtrl',["$scope","speakers","$ionicLoading", function (scope, speakers,loader ) {
    scope.speakers = [];
    speakers.get().then(function(response){
        scope.speakers=response.data
    },function(error){
      console.log(error)
    })
    // $ionicLoading.show({
    //   template: 'Loading...'
    // });

    // Speakers.get()
    //   .then(function (speakers) {
    //     $scope.speakers = speakers;
    //     $ionicLoading.hide();
    //   }, function (err) {
    //     $ionicLoading.hide();
    //   });

    // $scope.goToUrl = function (url) {
    //   //use inAppBrowser plugin
    //   window.open(url, '_blank', 'location=yes');
    // }
  }])

  .controller('VenueCtrl', function ($scope) {
    //map with venue position
    $scope.position = {
      lat: -34.892589,
      lng: -56.194638
    };

    $scope.$on('mapInitialized', function (event, map) {
      $scope.map = map;
    });
  })


  .controller('AgendaCtrl', ["$scope", "events", '$ionicLoading', function (scope, events, loader) {
    scope.events = []
    events.all().then(function (response) {
      console.log(response.data)
      scope.events=response.data
    }, function (error) {
      console.log(error)
    });

    // $scope.events = [];
    // $ionicLoading.show({
    //   template: 'Loading...'
    // });

    // Agenda.get()
    //   .then(function (events) {
    //     $scope.events = events;
    //     $ionicLoading.hide();
    //   }, function (err) {
    //     $ionicLoading.hide();
    //   });
  }])

  .controller('EventCtrl', ["$scope", "events","$stateParams", function (scope, events,params) {
    id=params.id
    events.get(id).then(function (response) {
      console.log(response)
      scope.event=response.data
    }, function (error) {
      console.log(error)
    });
    scope.shareEvent = function (event) {
      var speakersText = "";
      console.log("data")

      _.each(event.speakers, function (speaker, index) {
        speakersText += speaker.name;
        if ((index + 1) < event.speakers.length) {
          speakersText += " & ";
        }
      });
      var messageToShare = event.name + " by " + speakersText + " on "+event.times[0].date+" at "+event.times[0].start+" #NIW2017";
      window.plugins.socialsharing.share(messageToShare);
    };
    // var eventId = $stateParams.eventId;

    // $ionicLoading.show({
    //   template: 'Loading...'
    // });

    // Agenda.getEvent(eventId)
    //   .then(function (event) {
    //     $scope.event = event;
    //     $ionicLoading.hide();
    //   }, function (err) {
    //     $ionicLoading.hide();
    //   });

    // $scope.shareEvent = function (event) {
    //   var speakersText = "";

    //   _.each(event.speakers, function (speaker, index) {
    //     speakersText += speaker.name;
    //     if ((index + 1) < event.speakers.length) {
    //       speakersText += " & ";
    //     }
    //   });

    //   var messageToShare = event.title + " by " + speakersText + " at #JSConfUY";
    //   window.plugins.socialsharing.share(messageToShare);
    // };

  }])
  .controller("logoutCtrl", ['$scope', '$state', function (scope, state) {

    scope.logout = function () {
      state.go("app.speakers")
    }
  }])
