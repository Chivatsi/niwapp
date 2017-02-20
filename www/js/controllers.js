angular.module('jsconfuy.controllers', ['ngCordova'])

  .controller('AppCtrl', function ($scope) {

  })

  .controller('SpeakersCtrl', ["$scope", "speakers", "$ionicLoading", "$localStorage", "$cordovaToast", function (scope, speakers, loader, storage, toasta) {
    scope.speakers = [];

    function showloader(message) {
      // message = "Loading..."
      loader.show({
        template: message//, duration: 3000
      })
    }
    function showtoast(message, duration, location) {
      toasta.show(message, duration, location).then(function (success) {
        console.log("The toast was shown");
      }, function (error) {
        console.log("The toast was not shown due to " + error);
      });

    }
    scope.getspeakers = function (loadr) {
      if (loadr) {
        showloader("Fetching Speakers ...")
      }

      speakers.get().then(function (response) {
        scope.speakers = response.data
        storage.speakers = response.data
        loader.hide()
        scope.$broadcast('scroll.refreshComplete')
        showtoast("Speakers Updated :)", 'long', 'bottom')
      }, function (error) {
        loader.hide()
        scope.$broadcast('scroll.refreshComplete')
        if (error.data == null) {
          showtoast("No Internet connection", 'long', 'bottom')
        }
        console.log(error)

      })
    }
    if (storage.speakers == undefined || storage.speakers == null) {
      scope.getspeakers(true)
    }
    else {
      scope.speakers = storage.speakers
    }


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
      lat: -1.2797383,
      lng: 36.8160207
    };

    $scope.$on('mapInitialized', function (event, map) {
      $scope.map = map;
    });
  })

  .controller('AgendaCtrl', ["$scope", "events", '$ionicLoading', "$localStorage", "$ionicPlatform", "Account", "$ionicPopup", "$cordovaToast", "$filter", function (scope, events, loader, storage, plat, account, popup, toasta, filter) {
    Date.prototype.addDays = function (days) {
      var dat = new Date(this.valueOf());
      dat.setDate(dat.getDate() + days);
      return dat;
    }
    plat.ready(function () {
      android = plat.is("android")
      if ((storage.devicetoken == undefined || storage.devicetoken == null) && android) {
        //  alert("No Token Saved")
        window.plugins.OneSignal.getIds(function (ids) {
          console.log('getIds: ' + JSON.stringify(ids));
          //  alert("userId = " + ids.userId + ", pushToken = " + ids.pushToken);
          //alert(JSON.stringify(ids))
          account.devicetoken(ids).then(function (resp) {
            // showalert(JSON.stringify(resp.data))
            console.log("devices", ids)
            showtoast("Subscribed for notifications", "long", "bottom")
            storage.devicetoken = resp.data
          }, function (error) {
            if (error.data == null) {
              // showalert("No internet", JSON.stringify(error.data))
              showtoast("No Internet  Connection", "long", "top")
            }
            else {
              //  showalert(JSON.stringify(error.data))
              showtoast(JSON.stringify(error.data), "long", 'bottom')
            }
          });

        });
      }
      else {
        // alert(storage.devicetoken)
      }

    })
    function getEventtimes(events) {
      scope.data = {}
      var data = {}
      data.fstdate = {}
      data.scddate = {}
      var dts = []
      var mevents = []
      for (var i = 0; i < events.length; i++) {
        event = angular.copy(events[i])
        console.log(new Date(event.date + " " + event.start))
        newd = new Date(event.date) >= new Date()
        if (dts.indexOf(event.date) == -1 && newd) {
          dts.push(event.date)
        }
        event.start = new Date(event.date + " " + event.start)
        event.end = new Date(event.date + " " + event.end)
        mevents.push(event)
      }
      console.log(dts)
      if (dts.length >= 2) {
        console.log("More than Two")
        data.fstdate.date = new Date(dts[0])
        data.fstdate.events = filter("filter")(mevents, { "date": dts[0] }, true)
        data.scddate.date = new Date(dts[1])
        data.scddate.events = filter("filter")(mevents, { "date": dts[1] }, true)
        scope.data = data
      }
      else if (dts.length == 1) {
        console.log("One")
        data.fstdate.date = new Date(dts[0])
        data.fstdate.events = filter("filter")(mevents, { "date": dts[0] }, true)
        data.scddate.date = "Done"
        data.scddate.events = []
        scope.data = data

      }
      else if (dts.length == 0) {
        data.fstdate.date = "Done"
        data.fstdate.events = []
        data.scddate.date = "Done"
        data.scddate.events = []
        scope.data = data

      }

    }
    function showtoast(message, duration, location) {
      toasta.show(message, duration, location).then(function (success) {
        console.log("The toast was shown");
      }, function (error) {
        console.log("The toast was not shown due to " + error);
      });

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
    scope.events = []
    if (storage.events) {
      console.log("Found Events ...")
      scope.events = storage.events
      getEventtimes(scope.events)
    }
    else {
      scope.getmyevents()
    }
    scope.getmyevents = function () {
      events.userevents().then(function (response) {
        console.log(response.data)
        storage.events = response.data
        getEventtimes(response.data)
        scope.$broadcast('scroll.refreshComplete')
        showtoast("Schedule is now up to date", 'long', 'bottom')
      }, function (error) {
        scope.$broadcast('scroll.refreshComplete')
        if (error.data == null) {
          showtoast("No Internet Connection", 'long', 'bottom')
        }
        else if (error.status == 401) {
          showtoast("Logout and login again", 'long', 'bottom')
        }
        else {
          showtoast("Failed !!!", 'long', 'bottom')
        }

        console.log(error)
      });
    }

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
  .controller('EventCtrl', ["$scope", "events", "$stateParams", "$filter", "$ionicLoading", "$ionicPopup", function (scope, events, params, filter, loader, popup) {
    id = params.id

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
    scope.getevent = function () {
      showloader("Loading ...")
      events.get(id).then(function (response) {
        console.log(response)
        scope.event = response.data
        getEventtimes(response.data.times)
        loader.hide()
        scope.$broadcast('scroll.refreshComplete')
      }, function (error) {
        loader.hide()
        scope.$broadcast('scroll.refreshComplete')
        if (error.data == null) {
          showalert("Not internet connection <br>Turn on data or Wifi")
        }
        console.log(error)
      });
    }
    scope.getevent()
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
    function getEventtimes(events) {
      scope.data = {}
      var data = {}
      data.fstdate = {}
      data.scddate = {}
      var dts = []
      var mevents = []
      for (var i = 0; i < events.length; i++) {
        event = angular.copy(events[i])
        console.log(new Date(event.date + " " + event.start))
        newd = new Date(event.date) >= new Date()
        if (dts.indexOf(event.date) == -1) {
          dts.push(event.date)
        }
        event.start = new Date(event.date + " " + event.start)
        event.end = new Date(event.date + " " + event.end)
        mevents.push(event)
      }
      console.log(dts)
      var schedule = []
      for (var i = 0; i < dts.length; i++) {
        var date = {}
        date.date = dts[i]
        date.events = filter("filter")(mevents, { "date": dts[i] }, true)
        schedule.push(date)
      }
      scope.schedule = schedule

    }
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
      function showloader(message) {
        // message = "Loading..."
        loader.show({
          template: message//, duration: 3000
        })
      }
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
            scope.getschedule()
          }, function (error) {
            //alert("Done")
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
            else if (error.data == null) {
              // this.eheader = "No Internet Connection"
              showalert("No Internet Connection", "Turn on mobile data or wifi")
            }
            else {
              showalert("Error", JSON.stringify(error))
            }
            console.log(error)
          });
      }
      scope.getschedule = function () {
        showloader("Fetching schedule ...")
        events.userevents().then(function (resp) {
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
  .controller("SignupCtrl", ['$scope', '$state', "$ionicLoading", "$ionicPopup", function (scope, state, loader, popup) {
    scope.user = {}
    scope.user.fstname = ""
    scope.user.lstname = ""
    scope.user.username = ""
    scope.user.phone = ""
    scope.user.password = ""
    scope.user.cpassword = ""
    scope.valid = false
    scope.logout = function () {
      state.go("app.speakers")
    }
    // scope.$watch('user', function (new,old){
    //   console.log("changed")
    // });
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
    scope.$watch('user', function (newValue, oldValue) {
      validate()
    }, true);
    validate = function () {
      var em = 0
      angular.forEach(scope.user, function (value, element) {
        if (value == '') {
          console.log(element)
          em++;
        }
      })
      if (em == 0) {
        scope.valid = true
      }
      else {
        scope.valid = false
      }
    }
    scope.selectevent = function () {
      console.log(scope.user)
      if (scope.user.cpassword == scope.user.password) {
        state.go("eventsel", { "user": scope.user })
      } else {
        showalert("Passwords mismatch", "")
      }

    }
  }])
  .controller("logoutCtrl", ["$scope", "$localStorage", "$state", "$stateParams", function (scope, storage, state, params) {
    console.log(params.l)
    if (params.l) {
      storage.auth = null
      storage.events = null
      storage.devicetoken = null
      console.log("done")
      state.go("login")
      console.log("gone")
    }
  }])
  .controller("EventselCtrl", ["$scope", "$localStorage", "$stateParams", "$state", "events", "$ionicLoading", "$ionicPopup", "Account", function (scope, storage, params, state, events, loader, popup, account) {
    var user = params.user
    scope.events = []
    scope.myevents = []
    console.log(user)
    function showloader(message) {
      // message = "Loading..."
      loader.show({
        template: message//, duration: 3000
      })
    }
    showloader("Fetching events ...")
    events.all().then(function (resp) {
      loader.hide()
      scope.events = []
      angular.forEach(resp.data, function (value) {
        value.selected = false
        scope.events.push(value)
      })
      scope.events = resp.data
    }, function (error) {
      loader.hide()

      console.log(error)
      if (error.data) {
        showalert(error.statusText, error.data.detail)
      }
      else {
        showalert('No Internet Connection', "Turn on Mobile data or wifi")
      }
    })
    scope.addevents = function (event) {
      if (event.selected) {
        //  scope.myevents.push(event.id)
      }
      else {

      }
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

    scope.createschedule = function () {
      scope.myevents = []
      angular.forEach(scope.events, function (value) {
        if (value.selected) {
          scope.myevents.push(value.id)
        }
      })
      if (scope.myevents == 0) {
        showalert("No Events Selected", "Select atleast one event")
      } else {
        showloader("Creating account and schedule ..")
        user.events = scope.myevents
        account.signup(user).then(function () {
          loader.hide()
          scope.login(user.username, user.password)
        }, function (error) {
          loader.hide()
          console.log(error)
          if (error.data) {
            if (error.status == 401) {
              showalert("Exists", "User already exists")
            }
          }
          else {
            showalert('No Internet Connection', "Turn on Mobile data or wifi")
          }
        });
      }
      console.log(scope.myevents)
    }
    scope.login = function (username, password) {
      showloader("Signing in ...")
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
          }
          else {
            // this.eheader = "No Internet Connection"
            showalert("No Internet Connection", "Turn on mobile data or wifi")
          }
          console.log(error)
        });
    }
    getschedule = function () {
      showloader("Finalizing ...")
      events.userevents().then(function (resp) {
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

