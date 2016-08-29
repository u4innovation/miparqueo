angular.module('MiParqueo')
    .controller('MapaCtrl', ['$ionicLoading', '$ionicModal', '$scope', '$rootScope', '$cordovaGeolocation', '$http',
        function($ionicLoading, $ionicModal, s, r, $cordovaGeolocation, $http) {
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

            s.horaDesde = '0:0';
            s.horaHasta = '0:0';
            s.reservar = function() {
                s.vehiculo = 1;
                s.placa = 'XS7AD65';
                s.hai = (s.parqueoSeleccionado.HoraApertura + '').split('.')[0];
                s.hci = (s.parqueoSeleccionado.HoraCierre + '').split('.')[0];
                s.horasD = [];
                for (var i = parseInt(s.hai); i < parseInt(s.hci); i++) {
                    s.horasD.push(i + ':00');
                    s.horasD.push(i + ':30');
                }
                s.horasH = s.horasD.slice(1, s.horasD.length);
                s.horasH.push(s.hci + ':00');
                s.horaDesde = s.horasD[0];
                s.horaHasta = s.horasH[0];
                $ionicModal.fromTemplateUrl('templates/modals/reserva.html', {
                    scope: s,
                    animation: 'slide-in-right'
                }).then(function(modal) {
                    s.modalReserva = modal;
                    s.modalReserva.show();
                });
            }
            s.confirmarReserva = function() {
                $ionicLoading.show({
                    template: 'Reservando...'
                });
                var reserva = {
                    "owner": r.user._id,
                    "Usuario": r.user._id,
                    "Parqueo": s.parqueoSeleccionado._id,
                    "Placa": this.$$childHead.placa,
                    "HoraDesde": r.getDateTime(this.$$childHead.horaDesde),
                    "HoraHasta": r.getDateTime(this.$$childHead.horaHasta),
                    "Estado": 'P',
                    "TipoVehiculo": this.$$childHead.vehiculo,
                    "Monto": (r.formatHora(this.$$childHead.horaHasta)-r.formatHora(this.$$childHead.horaDesde)) * s.montos[this.$$childHead.vehiculo]
                };
                Stamplay.Object("reservas")
                  .save(reserva)
                  .then(function(res) {
                    s.modalDetalle.hide().then(function() {
                        s.modalReserva.remove().then(function() {
                            $ionicLoading.hide();
                        });
                    });
                  }, function(err) {
                    // Handle Error
                  });
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

            s.verParqueo = function() {
                s.parqueoSeleccionado = s.parqueosCercanos[this.array_pos];
                s.parqueoSeleccionado.dias = [false, false, false, false, false, false, false];
                s.rating = s.parqueoSeleccionado.actions.ratings.avg;
                s.valoraciones = s.parqueoSeleccionado.actions.ratings.total;
                s.montos = [parseFloat(s.parqueoSeleccionado.ValorXHoraL), parseFloat(s.parqueoSeleccionado.ValorXHoraP), parseFloat(s.parqueoSeleccionado.ValorXHoraM)];

                if (s.parqueoSeleccionado.DiasHabiles)
                    for (var i = 0; i < s.parqueoSeleccionado.DiasHabiles.length; i++) {
                        s.parqueoSeleccionado.dias[s.parqueoSeleccionado.DiasHabiles[i]] = true;
                    }
                s.modalDetalle.show();
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
        }
    ]);