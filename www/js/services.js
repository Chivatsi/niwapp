
var ur = "http://192.168.0.15:8000/"
//var ur="http://localhost:8000/"
//var ur = "http://niw.cloudapp.net/"
var serv=angular.module('jsconfuy.services', [])
  .service('Speakers', function ($http, $q) {

    this.get = function () {
      var dfd = $q.defer();

      $http.get('speakers.json')
        .success(function (data) {
          dfd.resolve(data);
        })
        .error(function (data) {
          dfd.reject(data);
        });

      return dfd.promise;
    };
  })
  .service('Agenda', function ($http, $q) {

    this.get = function () {
      var dfd = $q.defer();

      $http.get('agenda.json')
        .success(function (data) {

          var day1 = _.filter(data, function (event) { return event.date == "day1" }),
            day2 = _.filter(data, function (event) { return event.date == "day2" });

          dfd.resolve({
            "day1": day1,
            "day2": day2
          });
        })
        .error(function (data) {
          dfd.reject(data);
        });

      return dfd.promise;
    };

    this.getEvent = function (eventId) {
      var dfd = $q.defer();

      $http.get('agenda.json')
        .success(function (data) {
          var event = _.find(data, { id: eventId });
          dfd.resolve(event);
        })
        .error(function (data) {
          dfd.reject(data);
        });

      return dfd.promise;
    };
  });

serv.factory("events",["$http","$localStorage",function(http,storage){

  return{
    userevents:function(){
        var token=storage.auth
      return http.get(ur+"api/schedule",{headers:{"Authorization":"Bearer "+token.access_token}})
    },
    all:function(){
      var token=""
       if(storage.auth)
      {
        d=storage.auth
        token=d.access_token
      }
      return http.get(ur+"api/events",{headers:{"Authorization":"Bearer "+token}})
    },
    get:function(id){
      return http.get(ur+"api/events/"+id)
    },
    getall:function(){
      return http.get(ur+"api/events/all")
    },
    editschedule:function(data){
      var token=""
      if(storage.auth)
      {
        d=storage.auth
        token=d.access_token
      }
      return http.patch(ur+"api/delegate/2",data,{headers:{"Authorization":"Bearer "+token}})
    }

  }
}])
serv.factory("speakers",["$http",function(http){
  return{
    get:function(){
      return http.get(ur+"api/speakers")
    }
  
  }
}])
serv.factory("Account",["$http","$localStorage",function(http,storage){
  return{
    login:function(data){
      data+="&grant_type=password&client_id=BxyVff93MagKbQZfgsytPFOmFQRgzibbpT51Mf2u"
      return http.post(ur+"o/token/",data,{headers:{"Content-Type":"application/x-www-form-urlencoded"}})
    },
    signup:function(data){
      return http.post(ur+"api/delegate",data)
    },
    devicetoken:function(data){
      var token=storage.auth
     // alert("pushing")
      return http.post(ur+"api/pushnotifications",data,{headers:{"Authorization":"Bearer "+token.access_token}})
    }
  }
}])

