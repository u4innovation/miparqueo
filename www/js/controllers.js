angular.module('starter.controllers', [])

.controller('AccountController', ["AccountService", "$state", "$rootScope", "$ionicLoading", "$ionicPopup", "socialProvider", function(AccountService, $state, $rootScope, $ionicLoading, $ionicPopup, socialProvider) {

  var errorHandler = function(options) {
    var errorAlert = $ionicPopup.alert({
      title: options.title,
      okType : 'button-assertive',
      okText : "Try Again"
    });
  }

  var vm = this;

  vm.login = function() {
    Stamplay.User.socialLogin(socialProvider)
  }

  vm.logout = function() {
    $ionicLoading.show();
    var jwt = window.location.origin + "-jwt";
    window.localStorage.removeItem(jwt);
    AccountService.currentUser()
    .then(function(user) {
      $rootScope.user = user;
      $ionicLoading.hide();
    }, function(error) {
      console.error(error);
      $ionicLoading.hide();
    })
  }
}])

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation) {
  var options = {timeout: 30000, enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var element = document.getElementById("map");
    $scope.map = null;
    console.log("Posicion: "+ latLng);
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(element, mapOptions);
    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){
        var marker = new google.maps.Marker({
                                         map: $scope.map,
                                         animation: google.maps.Animation.DROP,
                                         position: latLng,
                                         icon: '../img/favicon.png'
                                         });      
     
        var infoWindow = new google.maps.InfoWindow({
                                                 content: "¡Aquí estoy!"
                                                 });
     
        google.maps.event.addListener(marker, 'click', function () {
                                   infoWindow.open($scope.map, marker);
                                   });
     
    });
                                                       
                                                       
                                                       
  }, function(error){
    console.log("Could not get location " + error);
  })
            
    
})

.controller('HomeController', ["TaskService", "$ionicLoading", "$rootScope", "$state", function(TaskService,  $ionicLoading, $rootScope, $state) {
  var vm = this;

  var findIndex = function(id) {
    return vm.tasks.map(function(task) {
      return task._id;
    }).indexOf(id);
  }

  // Display loading indicator
  $ionicLoading.show();

  vm.setActive = function(id) {
    vm.active = id;
  }

  function removeActive() {

  }

  // Fetch Tasks
  vm.fetch = function() {
    if(!$rootScope.user) {
      // Get all tasks for guests.
      TaskService.getGuestTasks()
      .then(
        function(response) {
          var tasks = response.data;
          vm.tasks = [];
          tasks.forEach(function(item, idx, array) {
            item.dt_create = new Date(item.dt_create).getTime();
            vm.tasks.push(array[idx]);
          });
          $ionicLoading.hide();
        }, function(error) {
          $ionicLoading.hide();
        })
      } else {
        // Get only the user signed in tasks.
        TaskService.getUsersTasks()
        .then(
          function(response) {
            var tasks = response.data;
            vm.tasks = [];
            tasks.forEach(function(item, idx, array) {
              item.dt_create = new Date(item.dt_create).getTime();
              vm.tasks.push(array[idx]);
            });
            $ionicLoading.hide();
          }, function(error) {
            $ionicLoading.hide();
          })
        }
      }



      // Mark Complete a task.
      vm.deleteTask = function(id) {
        $ionicLoading.show();
        vm.tasks.splice(findIndex(id), 1);
        TaskService.deleteTask(id)
        .then(function() {
          $ionicLoading.hide();
        }, function(error) {
          $ionicLoading.hide();
        })
      }

      vm.setStatus = function(task) {
        task.complete = task.complete ? !task.complete : true;
        TaskService.patchTask(task)
        .then(function(task) {
        }, function(error) {
        })
      }


    }])

.controller('TaskController', ["TaskService", "$ionicLoading", "$rootScope", "$state", "$stateParams", function(TaskService,  $ionicLoading, $rootScope, $state, $stateParams) {
  var vm = this;

  if($stateParams.id) {
    $ionicLoading.show();
    TaskService.getTask($stateParams.id)
      .then(function(task) {
        $ionicLoading.hide();
        vm.task = task.data[0];
      }, function(err) {
        $ionicLoading.hide();
        console.error(err);
      })
  }

  // Add a task.
  vm.add = function() {
    $ionicLoading.show();
    TaskService.addNew(vm.task)
    .then(function(task) {
      $ionicLoading.hide();
      $state.go("tasks", {}, { reload: true });
    }, function(error) {
      $ionicLoading.hide();
    })
  }

  vm.save = function() {
    $ionicLoading.show();
    TaskService.updateTask(vm.task)
    .then(function(task) {
      $ionicLoading.hide();
      $state.go("tasks", {}, { reload: true });
    }, function(error) {
      $ionicLoading.hide();
    })
  }





}])
