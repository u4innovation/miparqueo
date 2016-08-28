angular.module('starter.controllers', [])

.controller('AppCtrl', function($ionicModal, AccountService, $state, $scope, $rootScope, $ionicLoading, $ionicPopup, socialProvider, $timeout) {
    $scope.loginData = {};
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };
    $scope.showLogin = function() {
        $scope.modal.show();
    };
    $scope.login = function(i) {
        Stamplay.User.socialLogin(socialProvider[i])
    };
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
        $scope.dias = [{
            nombre: 'Lunes',
            checked: false
        }, {
            nombre: 'Martes',
            checked: false
        }, {
            nombre: 'Miercoles',
            checked: false
        }, {
            nombre: 'Jueves',
            checked: false
        }, {
            nombre: 'Viernes',
            checked: false
        }, {
            nombre: 'Sabado',
            checked: false
        }, {
            nombre: 'Domingo',
            checked: false
        }];
        $scope.paises = [];

        Stamplay.Object("paises").get({
            populate: true
        })
            .then(function(res) {
                $scope.paises = res.data;
            }, function(err) {
                // error
            })
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
            var diasSeleccionados = [];
            for (var i = 0; i < $scope.dias.length; i++) {
                if ($scope.dias[i].checked) {
                    $scope.dias[i].checked = false;
                    diasSeleccionados.push(i);
                }
            }
            var stamplay = {
                "Direccion": this.Direccion,
                "TelefonoContacto": this.Telefono,
                "email": this.Correo,
                "HoraApertura": this.HorarioA,
                "HoraCierre": this.HorarioC,
                "Nombre": this.Nombre,
                "ValorXHoraP": this.PrecioP,
                "ValorXHoraL": this.PrecioL,
                "ValorXHoraM": this.PrecioM,
                "DiasHabiles": diasSeleccionados,
                "_geolocation": {
                    "type": "Point",
                    "coordinates": [$scope.lng, $scope.lat]
                }
            };
            this.Direccion = this.HorarioA = this.HorarioC = this.Telefono = this.Correo = this.Nombre = this.PrecioP = this.PrecioL = this.PrecioM = $scope.lat = $scope.lng = '';
            Stamplay.Object('parqueos').save(stamplay).then(function() {
                $ionicLoading.hide();
            });
        }
    })
    .controller('MapaCtrl', ['$ionicLoading', '$ionicModal', '$scope', '$rootScope', '$cordovaGeolocation', '$http',function($ionicLoading, $ionicModal, s, r, $cordovaGeolocation, $http) {
        s.radioBusqueda = 500;
        s.markerBusqueda;
        s.location = $cordovaGeolocation;
        s.currPos = {
            lat: 0,
            lng: 0
        };
        s.parqueoSeleccionado = {
            nombre: 'dasdas'
        };
        $ionicModal.fromTemplateUrl('templates/modals/direcciones-modal.html', {
            scope: s
        }).then(function(modal) {
            s.modalAddr = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modals/detalle-parqueo.html', {
            scope: s,
            animation: 'slide-in-up'
        }).then(function(modal) {
            s.modalDetalle = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modals/reserva.html', {
            scope: s,
            animation: 'slide-in-right'
        }).then(function(modal) {
            s.modalReserva = modal;
        });
        s.reservar = function(){
           s.modalReserva.show(); 
        }
        s.confirmarReserva = function(){
            $ionicLoading.show({
                    template: 'Reservando...'
                });
            s.modalDetalle.hide();
            s.modalReserva.hide();
            $ionicLoading.hide();
        }
        s.limpiarInput = function() {
            this.direccion = '';
        };
        s.mapCreated = function(map) {
            s.map = map;
        };
        s.buscarDireccion = function() {
            if (this.direccion && this.direccion !== '') {
                $ionicLoading.show({
                    template: 'Buscando...'
                });
                that = this;
                $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + this.direccion.replace(/ /g, '+') + '&key=AIzaSyC1YLbGt2lAvgW_2NTZ1YT0PJ5TJDcGWyU').then(function(resp) {
                    s.address = resp.data.results;
                    $ionicLoading.hide();
                    s.modalAddr.show();
                    that.direccion = '';
                });
            }
        }
        s.selectAddr = function(item) {
            var latLong = new google.maps.LatLng(item.geometry.location.lat, item.geometry.location.lng);
            s.map.setCenter(latLong, 15);
            s.modalAddr.hide();
            s.direccion = '';
            if (s.markerBusqueda) {
                s.markerBusqueda.setMap(null);
            }
            s.markerBusqueda = new google.maps.Marker({
                position: latLong,
                map: s.map,
                icon: 'img/UbicacionUsuarioOpcion2_.png'
            });
            s.circulo(s.markerBusqueda);
            s.busquedaRealizada = true;
            s.currPos = {
                lat: item.geometry.location.lat,
                lng: item.geometry.location.lng
            };
            s.consultarParqueos();
        }
        s.cancelarBusqueda = function() {
            s.modalAddr.hide();
        }
        s.toggleOpciones = function() {
            s.viewOpciones = !s.viewOpciones;
            if (!s.viewOpciones && s.radioChanged) {
                s.consultarParqueos();
                s.radioChanged = false;
            }
        }
        s.circulo = function(marker) {
            var sunCircle = {
                strokeColor: "#62B2FC",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#62B2FC",
                fillOpacity: 0.35,
                map: s.map,
                radius: s.radioBusqueda // in meters
            };
            if (s.cityCircle) {
                s.cityCircle.setMap(null);
            }
            s.cityCircle = new google.maps.Circle(sunCircle);
            s.cityCircle.bindTo('center', marker, 'position');
        }
        s.cambiarRadio = function(t) {
            var r = s.radioBusqueda;
            if (t == 0) {
                s.radioBusqueda = r < 1500 ? r + 100 : 1500
            } else {
                s.radioBusqueda = r != 100 ? r - 100 : 100
            }
            s.radioChanged = true;
            s.circulo(s.busquedaRealizada ? s.markerBusqueda : s.markerLocation);
        }
        s.iniciarMapa = function($element) {
            var mapOptions = {
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true
            };
            s.map = new google.maps.Map(document.getElementById('mapa'), mapOptions);
            s.centrarMapa();
        }
        s.centrarMapa = function() {
            $ionicLoading.show({
                template: 'Cargando...'
            });
            var options = {
                timeout: 30000,
                enableHighAccuracy: true
            };
            s.location.getCurrentPosition(options).then(function(position) {
                var latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                s.map.setCenter(latLong);
                s.map.setZoom(15);
                if (s.markerLocation) {
                    s.markerLocation.setMap(null);
                }
                s.markerLocation = new google.maps.Marker({
                    position: latLong,
                    map: s.map,
                    icon: 'img/UbicacionUsuario_.png'
                });
                s.circulo(s.markerLocation);
                if (s.markerBusqueda) s.markerBusqueda.setMap(null);
                s.currPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                s.consultarParqueos();
                $ionicLoading.hide();
            }, function(error) {
                console.log(error.message);
            })
        }
        s.parqueosCercanosMarker = [];
        s.consultarParqueos = function() {
            $ionicLoading.show({
                template: 'Buscando...'
            });
            Stamplay.Query('object', 'parqueos')
                .near('Point', [s.currPos.lng, s.currPos.lat], s.radioBusqueda)
                .exec().then(function(res) {
                    s.parqueosCercanos = res.data;
                    s.removeParqueosMarkers();
                    for (var i = 0; i < res.data.length; i++) {
                        var coord = res.data[i]._geolocation.coordinates;
                        s.parqueosCercanosMarker.push(new google.maps.Marker({
                            position: new google.maps.LatLng(coord[1], coord[0]),
                            map: s.map,
                            icon: 'img/EstacionamientosIcon_.png',
                            array_pos: i
                        }));
                        s.parqueosCercanosMarker[i].addListener('click', s.verParqueo);
                    }
                    $ionicLoading.hide();
                });
        }
        s.horaDesde = '0';
        s.horaHasta = '0';
        s.verParqueo = function() {
            s.parqueoSeleccionado = s.parqueosCercanos[this.array_pos];
            s.parqueoSeleccionado.dias = [false, false, false, false, false, false, false];
            s.rating = s.parqueoSeleccionado.actions.ratings.avg;
            s.valoraciones = s.parqueoSeleccionado.actions.ratings.total;
            s.montos = [parseFloat(s.parqueoSeleccionado.ValorXHoraL),parseFloat(s.parqueoSeleccionado.ValorXHoraP),parseFloat(s.parqueoSeleccionado.ValorXHoraM)];
            s.vehiculo = 0;
            s.hai = (s.parqueoSeleccionado.HoraApertura+'').split('.')[0];
            s.hci = (s.parqueoSeleccionado.HoraCierre+'').split('.')[0];
            s.horasD = [];
            for (var i = parseInt(s.hai); i < parseInt(s.hci); i++) {
                s.horasD.push(i+':00');
                s.horasD.push(i+':30');
            }
            s.horasH = s.horasD.slice(1,s.horasD.length);
            s.horasH.push(s.hci+':00');
            s.horaDesde = s.horasD[0];
            s.horaHasta = s.horasH[0];
            if (s.parqueoSeleccionado.DiasHabiles)
                for (var i = 0; i < s.parqueoSeleccionado.DiasHabiles.length; i++) {
                    s.parqueoSeleccionado.dias[s.parqueoSeleccionado.DiasHabiles[i]] = true;
                }
            s.modalDetalle.show();
        }
        s.updateHasta = function(){
            s.horasH = s.horasD.slice(s.horasD.indexOf(this.horaDesde)+1,s.horasD.length);
            s.horasH.push(s.hci+':00');
            if (s.horasD.indexOf(this.horaDesde)>=s.horasD.indexOf(this.horaHasta))
                this.horaHasta = s.horasH[0];
        }
        s.formatTime = function(time){
            time = (time+"").split('.');
            return time[0]+':'+(time[1]?time[1]:'00');
        }
        s.formatHora = function(hora){
            return parseFloat(hora.replace(':','.').replace('3','5'));
        }
        s.parqRating = function(value) {
            Stamplay.Object("parqueos").rate(s.parqueoSeleccionado._id, value)
                .then(function(res) {}, function(err) {})
        }
        s.removeParqueosMarkers = function() {
            for (var i = 0; i < s.parqueosCercanosMarker.length; i++) {
                s.parqueosCercanosMarker[i].setMap(null)
            }
            s.parqueosCercanosMarker = [];
        }
    }]);