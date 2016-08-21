angular.module('starter.controllers', [])

.controller('AppCtrl', function($ionicModal, AccountService, $state, $scope, $rootScope, $ionicLoading, $ionicPopup, socialProvider, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Triggered in the login modal to open it
  $scope.showLogin = function() {
    $scope.modal.show();
  };

  // Open the login modal
  $scope.login = function() {
    Stamplay.User.socialLogin(socialProvider)
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  }
  $scope.logout = function() {
    $ionicLoading.show();
    var jwt = window.location.origin + "-jwt";
    window.localStorage.removeItem(jwt);
    AccountService.currentUser()
    .then(function(user) {
      $rootScope.user = user;
      $scope.showLogin();
      $ionicLoading.hide();
    }, function(error) {
      console.error(error);
      $ionicLoading.hide();
    })
  }
})

.controller('HomeCtrl', function($scope, $rootScope, $timeout) {
  $timeout(function() {
    if(!$rootScope.user){
      //$scope.modal.show();
    }
  }, 1000);
})


.controller('MapaCtrl', function($ionicLoading, $ionicModal, $scope,$rootScope,$cordovaGeolocation,$http) {
  $ionicModal.fromTemplateUrl('templates/direcciones-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalAddr = modal;
  });
  $scope.markerBusqueda;
  $scope.location = $cordovaGeolocation;  
  $scope.mapCreated = function(map) {
    $scope.map = map;
  };
  $scope.buscarDireccion = function(direccion){
    var q = direccion
    if(q && q !== ''){
      $ionicLoading.show({
        template: 'Loading...'
      });
      $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+q.replace(/ /g, '+')+'&key=AIzaSyC1YLbGt2lAvgW_2NTZ1YT0PJ5TJDcGWyU').then(function(resp){
        $scope.address = resp.data.results;
        $ionicLoading.hide();
        $scope.modalAddr.show();
      });
    }
  }
  $scope.selectAddr = function(item){
    var latLong = new google.maps.LatLng(item.geometry.location.lat, item.geometry.location.lng);
    $scope.map.setCenter(latLong,15);
    $scope.modalAddr.hide();
    $scope.direccion = '';
    if($scope.markerBusqueda){
      $scope.markerBusqueda.setMap(null);
    }
    $scope.markerBusqueda = new google.maps.Marker({
      position: latLong,
      map: $scope.map,
      icon: 'img/UbicacionUsuarioOpcion2_.png'
    });
  }
  $scope.cancelarBusqueda = function(){
    $scope.modalAddr.hide();
  }
  $scope.iniciarMapa = function($element){
    $ionicLoading.show({
      template: 'Loading...'
    });
    var options = {timeout: 30000, enableHighAccuracy: true};
    $scope.location.getCurrentPosition(options).then(function(position){
      var latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      var mapOptions = {
        center: latLong,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
      };
      $scope.map = new google.maps.Map(document.getElementById('mapa'), mapOptions);
      $scope.markerLocation = new google.maps.Marker({
        position: latLong,
        map: $scope.map,
        icon: 'img/UbicacionUsuario_.png'
      });
      $ionicLoading.hide();
         
}, function(error){
  console.log(error.message);
})
  }
  $scope.centrarMapa = function(){
    $ionicLoading.show({
      template: 'Loading...'
    });
        var options = {timeout: 30000, enableHighAccuracy: true};
    $scope.location.getCurrentPosition(options).then(function(position){
      var latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      $scope.map.setCenter(latLong,15);
      $scope.markerLocation.setMap(null);
      $scope.markerLocation = new google.maps.Marker({
        position: latLong,
        map: $scope.map,
        icon: 'img/UbicacionUsuario_.png'
      });
      $ionicLoading.hide(); 
}, function(error){
  console.log(error.message);
})
  }
})
