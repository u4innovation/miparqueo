angular.module('MiParqueo', ['ionic','ngCordova', 'MiParqueo.services'])
.run(function($ionicPlatform, $rootScope, AccountService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  $rootScope.formatTime = function(time) {
    time = (time + "").split('.');
    return time[0] + ':' + (time[1] ? time[1] : '00');
  }
  $rootScope.formatHora = function(hora) {
    hora = hora.split(':');
    return parseFloat(hora[0] + '.' + hora[1].replace('3', '5'));
  }
  $rootScope.getDateTime = function(time) {
    var date = new Date();
    time = time.split(':');
    date.setHours(time[0]);
    date.setMinutes(time[1]);
    return date;
  };
  $rootScope.updateHasta = function(s) {
    s.horasH = s.horasD.slice(s.horasD.indexOf(this.horaDesde) + 1, s.horasD.length);
    s.horasH.push(s.hci + ':00');
    if (s.horasD.indexOf(this.horaDesde) >= s.horasD.indexOf(this.horaHasta))
      this.horaHasta = s.horasH[0];
  };
  AccountService.currentUser()
  .then(function(user) {
    $rootScope.user = user;
    //$rootScope.user = {"_id":"57b7ac4fe1af8c0434720491","appId":"miparqueo","displayName":"Gonzalo Aller","name":{"familyName":"Aller","givenName":"Gonzalo"},"pictures":{"facebook":"https://graph.facebook.com/10210477627084919/picture"},"givenRole":"57af24c32e101f405ecebd4a","email":"gonzaller@me.com","identities":{"facebook":{"facebookUid":"10210477627084919","_json":{"timezone":-3,"first_name":"Gonzalo","last_name":"Aller","locale":"es_LA","picture":{"data":{"url":"https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13322155_10209828060006148_4865973369382732877_n.jpg?oh=44baf6b5e046137288fd83c114b491d0&oe=5856DB75","is_silhouette":false}},"link":"https://www.facebook.com/app_scoped_user_id/10210477627084919/","gender":"male","email":"gonzaller@me.com","age_range":{"min":21},"name":"Gonzalo Aller","id":"10210477627084919"},"emails":[{"value":"gonzaller@me.com"}],"accessToken":"EAAIjuROBonoBAPZA6EgZCsmhgJZC7OdA2sTOnDXxTijYRmMPpgCgn3eBx2p9msnBO6UZAGrM6HOZBDLxBqkSz16WeuWDvzKMiQCWAEXpNEpDDaNfd3FOabVQ1nZCo3xrZCfOD5MtgLy6Io8ZBArZCukjuj86T1dXzCSgZD"}},"__v":0,"dt_update":"2016-08-28T23:28:18.400Z","dt_create":"2016-08-20T01:03:11.170Z","emailVerified":true,"verificationCode":"907089e2acc08ad816d3","profileImg":"https://graph.facebook.com/10210477627084919/picture","id":"57b7ac4fe1af8c0434720491"};

  })
})

.constant("socialProvider", ["facebook","google"])

.constant('$ionicLoadingConfig', {
  template: "<ion-spinner></ion-spinner>",
  hideOnStateChange : false
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.carga', {
    url: '/cargaparqueo',
    views: {
      'menuContent': {
        templateUrl: 'templates/cargaparqueo.html',
        controller: 'CargaCtrl'
      }
    }
  })
  .state('app.mapa', {
    url: '/mapa',
    views: {
      'menuContent': {
        templateUrl: 'templates/mapa.html',
        controller: 'MapaCtrl'
      }
    }
  })
  .state('app.historial', {
    url: '/historial',
    views: {
      'menuContent': {
        templateUrl: 'templates/historial.html',
        controller: 'HistorialCtrl'
      }
    }
  })
  .state('app.perfil', {
    url: '/perfil',
    views: {
      'menuContent': {
        templateUrl: 'templates/perfil.html',
        controller: 'PerfilCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/mapa');
})
.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&',
      initFunct: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {
        $scope.initFunct();
      }
      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
}).directive('onEnter', function() {
  return {
    restrict: "A",
    scope: {
      action: "&onEnter"
    },
    link: function(scope, element, attrs) {
      element.on("keydown keypress", function(event) {
        if(event.which === 13) {
          scope.$apply(scope.action);
          event.preventDefault();
        }
      });
    }
  };
});
