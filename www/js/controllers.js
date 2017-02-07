angular.module('jsconfuy.controllers', [])

  .controller('AppCtrl', function ($scope) {

  })

  .controller('SpeakersCtrl', ["$scope", "speakers", "$ionicLoading", function (scope, speakers, loader) {
    scope.speakers = [];
    speakers.get().then(function (response) {
      scope.speakers = response.data
    }, function (error) {
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

  .controller('AgendaCtrl', ["$scope", "events", '$ionicLoading', "$localStorage", function (scope, events, loader, storage) {
    scope.events = []
    if (storage.events) {
      scope.events = storage.events
    }
    events.all().then(function (response) {
      console.log(response.data)
      scope.events = response.data
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
  .controller('EventCtrl', ["$scope", "events", "$stateParams", function (scope, events, params) {
    id = params.id
    events.get(id).then(function (response) {
      console.log(response)
      scope.event = response.data
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
      var messageToShare = event.name + " by " + speakersText + " on " + event.times[0].date + " at " + event.times[0].start + " #NIW2017";
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
  .controller("LoginCtrl", ['$scope', '$state', "Account", "$ionicLoading", "$ionicPopup", "events",
    "$localStorage", function (scope, state, account, loader, popup, events, storage) {
      scope.username = ""
      scope.password = ""
      if (storage.auth) {
        state.go("app.agenda")
      }
      scope.logout = function () {
        state.go("app.speakers")
      }
      function showloader(message) {
       // message = "Loading..."
        loader.show({
          template: message//, duration: 3000
        })
      }
      showalert = function (title, message) {
        scope.alertPopup = popup.alert({
          title: title,
          template: message,
          okType: 'button-assertive'
        });

        scope.alertPopup.then(function (res) {
          // console.log('Thank you for not eating my delicious ice cream cone');
        });
      };
      scope.login = function (username, password) {
        showloader("Loading ...")
        account.login("username=" + username + "&password=" + password)
          .then(function (resp) {
            loader.hide()
            History
            console.log(resp.data)
            storage.auth = resp.data
            getschedule()
          }, function (error) {
            loader.hide()
            // showalert("Error",error.data)
            if (error.data != null) {
              if (error.data.error_description) {
                //if(error.data.error_description=="")
                showalert(error.statusText, error.data.error_description)
              } else {
                showalert(error.statusText, error.data.error.replace("_", " "))
              }
              // this.eheader = error.statusText
              // if (error.url == null) {
              //  showalert(error.statusText, "Check your internet connection")
              // }
              // else if (error.status == 400) {
              //  showalert(error.statusText, "Confirm email and password")
              // }
            }
            else {
              // this.eheader = "No Internet Connection"
              showalert("No Internet Connection", "Turn on mobile data or wifi")
            }
            console.log(error)
          });
      }
      getschedule = function () {
        showloader("Fetching schedule ...")
        events.all().then(function (resp) {
          loader.hide()
          console.log(resp)
          storage.events = resp.data
          state.go("app.agenda")
        }, function (error) {
          loader.hide()
          if (error.data) {
            showalert(error.statusText, error.data.detail)
          }

          console.log(error)
        })
      }

    }])
  .controller("SignupCtrl", ['$scope', '$state', function (scope, state) {

    scope.logout = function () {
      state.go("app.speakers")
    }
  }])
  .controller("logoutCtrl", ["$scope", "$localStorage", "$state", "$stateParams", function (scope, storage, state, params) {
   console.log(params.l)
    if (params.l) {
      storage.auth = null
      storage.events = null
      console.log("done")
      state.go("login")
      console.log("gone")
    }


  }])

