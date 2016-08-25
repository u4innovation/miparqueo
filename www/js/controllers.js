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
    .controller('CargaCtrl', function($scope, $rootScope, $timeout, $ionicLoading, $cordovaGeolocation) {

        $scope.getLocation = function() {
            var options = {
                timeout: 30000,
                enableHighAccuracy: true
            };
            $ionicLoading.show({
                template: 'Loading...'
            });
            $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
                $scope.lat = position.coords.latitude;
                $scope.lng = position.coords.longitude;
                $ionicLoading.hide();
            }, function(error) {
                console.log(error.message);
            });
        }
        $scope.guardar = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
            var stamplay = {
                "Direccion": this.Direccion,
                "Horario": this.Horario,
                "Nombre": this.Nombre,
                "ValorXHora": this.Precio,
                "_geolocation": {
                    "type": "Point",
                    "coordinates": [$scope.lat, $scope.lng]
                }
            };
            this.Direccion = this.Horario = this.Nombre = this.Precio = $scope.lat = $scope.lng = '';
            Stamplay.Object('parqueos').save(stamplay).then(function() {
                $ionicLoading.hide();
            });
        }
    })
    .controller('MapaCtrl', function($ionicLoading, $ionicPopup, $ionicModal, $scope, $rootScope, $cordovaGeolocation, $http) {
        $scope.radioBusqueda = 500;
        $scope.markerBusqueda;
        $scope.location = $cordovaGeolocation;
        $scope.currPos = {lat:0,lng:0};
        $scope.parqueoSeleccionado = {
            nombre: 'dasdas'
        };
        $ionicModal.fromTemplateUrl('templates/modals/direcciones-modal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modalAddr = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modals/detalle-parqueo.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modalDetalle = modal;
        });
        $scope.limpiarInput = function() {
            this.direccion = '';
        };
        $scope.mapCreated = function(map) {
            $scope.map = map;
        };
        $scope.buscarDireccion = function() {
            if (this.direccion && this.direccion !== '') {
                $ionicLoading.show({
                    template: 'Buscando...'
                });
                that = this;
                $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + this.direccion.replace(/ /g, '+') + '&key=AIzaSyC1YLbGt2lAvgW_2NTZ1YT0PJ5TJDcGWyU').then(function(resp) {
                    $scope.address = resp.data.results;
                    $ionicLoading.hide();
                    $scope.modalAddr.show();
                    that.direccion = '';
                });
            }
        }
        $scope.selectAddr = function(item) {
            var latLong = new google.maps.LatLng(item.geometry.location.lat, item.geometry.location.lng);
            $scope.map.setCenter(latLong, 15);
            $scope.modalAddr.hide();
            $scope.direccion = '';
            if ($scope.markerBusqueda) {
                $scope.markerBusqueda.setMap(null);
            }
            $scope.markerBusqueda = new google.maps.Marker({
                position: latLong,
                map: $scope.map,
                icon: 'img/UbicacionUsuarioOpcion2_.png'
            });
            $scope.circulo($scope.markerBusqueda);
            $scope.busquedaRealizada = true;
            $scope.currPos = {lat: item.geometry.location.lat, lng: item.geometry.location.lng};
            $scope.consultarParqueos();
        }
        $scope.cancelarBusqueda = function() {
            $scope.modalAddr.hide();
        }
        $scope.toggleOpciones = function(){
            $scope.viewOpciones = !$scope.viewOpciones;
            if(!$scope.viewOpciones && $scope.radioChanged){
                $scope.consultarParqueos();
                $scope.radioChanged = false;
            }
        }
        $scope.circulo = function(marker){
            var sunCircle = {
                strokeColor: "#62B2FC",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#62B2FC",
                fillOpacity: 0.35,
                map: $scope.map,
                radius: $scope.radioBusqueda // in meters
            };
            if ($scope.cityCircle) {
                $scope.cityCircle.setMap(null);
            }
            $scope.cityCircle = new google.maps.Circle(sunCircle);
            $scope.cityCircle.bindTo('center', marker, 'position');
        }
        $scope.cambiarRadio = function(t) {
            var r = $scope.radioBusqueda;
            if (t == 0) {
                $scope.radioBusqueda = r < 1500 ? r + 100 : 1500
            } else {
                $scope.radioBusqueda = r != 100 ? r - 100 : 100
            }
            $scope.radioChanged = true;
            $scope.circulo($scope.busquedaRealizada ? $scope.markerBusqueda : $scope.markerLocation);
        }
        $scope.iniciarMapa = function($element) {
            var mapOptions = {
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true
            };
            $scope.map = new google.maps.Map(document.getElementById('mapa'), mapOptions);
            $scope.centrarMapa();
        }
        $scope.centrarMapa = function() {
            $ionicLoading.show({
                template: 'Cargando...'
            });
            var options = {
                timeout: 30000,
                enableHighAccuracy: true
            };
            $scope.location.getCurrentPosition(options).then(function(position) {
                var latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                $scope.map.setCenter(latLong);
                $scope.map.setZoom(15);
                if ($scope.markerLocation) {
                    $scope.markerLocation.setMap(null);
                }
                $scope.markerLocation = new google.maps.Marker({
                    position: latLong,
                    map: $scope.map,
                    icon: 'img/UbicacionUsuario_.png'
                });
                $scope.circulo($scope.markerLocation);
                if ($scope.markerBusqueda) $scope.markerBusqueda.setMap(null);
                $scope.currPos = {lat: position.coords.latitude,lng: position.coords.longitude};
                $scope.consultarParqueos();
                $ionicLoading.hide();
            }, function(error) {
                console.log(error.message);
            })
        }
        $scope.parqueosCercanosMarker = [];
        $scope.consultarParqueos = function() {
            $ionicLoading.show({
                    template: 'Buscando...'
                });
            Stamplay.Query('object', 'parqueos')
                .near('Point', [$scope.currPos.lat, $scope.currPos.lng], $scope.radioBusqueda)
                .exec().then(function(res) {
                    $scope.parqueosCercanos = res.data;
                    $scope.removeParqueosMarkers();
                    for (var i = 0; i < res.data.length; i++) {
                        var coord = res.data[i]._geolocation.coordinates;
                        $scope.parqueosCercanosMarker.push(new google.maps.Marker({
                            position: new google.maps.LatLng(coord[0], coord[1]),
                            map: $scope.map,
                            icon: 'img/EstacionamientosIcon_.png',
                            array_pos: i
                        }));
                        $scope.parqueosCercanosMarker[i].addListener('click', $scope.verParqueo);
                    }
                    $ionicLoading.hide();
                });
        }
        $scope.verParqueo = function() {
            $scope.parqueoSeleccionado = $scope.parqueosCercanos[this.array_pos];
            $scope.modalDetalle.show();
        }
        $scope.removeParqueosMarkers = function() {
            for (var i = 0; i < $scope.parqueosCercanosMarker.length; i++) {
                $scope.parqueosCercanosMarker[i].setMap(null)
            }
            $scope.parqueosCercanosMarker = [];
        }
    });