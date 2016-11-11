angular.module('MiParking').controller('MapaCtrl', ['$ionicPlatform','$ionicLoading', '$ionicModal', '$scope', '$rootScope', '$cordovaGeolocation', '$http', '$ionicPopup', '$timeout', '$window', 'PayphoneService', MapaCtrl])

function MapaCtrl($ionicPlatform, $ionicLoading, $ionicModal, s, r, $cordovaGeolocation, $http, $ionicPopup, $timeout, $window, PayphoneService) {
    $ionicPlatform.ready(function() {
        
        if (window.plugin) {
            var mapDiv = document.getElementById("map_canvas");
            var map = plugin.google.maps.Map.getMap(mapDiv,{
            backgroundColor: 'white',
            mapType: plugin.google.maps.MapTypeId.ROADMAP,
            'camera': {
            'zoom': 15
            }
        });
            // You have to wait the MAP_READY event.
            map.on(plugin.google.maps.event.MAP_READY, s.onMapInit);
        }
    });
    s.dev_width = $window.innerWidth;
    s.$on('$ionicView.afterEnter', function() {
        ionic.trigger('resize');
    });
    s.loadingAlert = function(text) {
        $ionicLoading.show({
            template: text
        });
        $timeout(function() {
            $ionicLoading.hide();
        }, 2000);
    };
    
    s.pagar = function(reserva) {
        s.pago = {
            monto: reserva.Monto,
            celular: r.user.perfil.celular
        };
        var myPopup = $ionicPopup.show({
            templateUrl: 'templates/modals/payphone.html',
            title: '<img src="img/payphone.png" class="logo-payphone">',
            scope: s,
            buttons: [{
                text: 'Cancelar'
            }, {
                text: '<b>Pagar</b>',
                type: 'button-balanced',
                onTap: function(e) {
                    if (!s.pago.celular || s.pago.celular == '') {
                        e.preventDefault();
                    } else {
                        $ionicLoading.show({
                            template: 'Procesando pago...'
                        });
                        PayphoneService.pay(593, s.pago.celular, s.pago.monto, s.lat, s.long).then(function(data) {
                            $ionicLoading.hide();
                            $ionicLoading.show({
                                template: 'Reservando...'
                            });
                            Stamplay.Object("reservas")
                                .save(reserva)
                                .then(function(res) {
                                    s.modalDetalle.hide().then(function() {
                                        s.modalReserva.remove().then(function() {
                                            $ionicLoading.hide();
                                            s.loadingAlert('Reserva Realizada! <br> consulte su historial para los detalles.', true);
                                        });
                                    });

                                }, function(err) {
                                    s.loadingAlert('Ocurrio un error con su reserva, intente mas tarde');
                                });
                        }, function(err) {
                            $ionicLoading.hide();
                            s.loadingAlert('Ocurrio un error con su pago, ' + err.data[0].Message);
                        });
                    }
                }
            }]
        });
    }
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
    s.parqRating = function() {
        $ionicLoading.show({
            template: 'Calificando...'
        });
        Stamplay.Object("parqueos").rate("57b9ff44524a403829dc7279", 3)
            .then(function(res) {
                $ionicLoading.hide();
                s.loadingAlert('Gracias por su calificación!');
                reserva.actions.ratings.avg = s.rating;
            }, function(err) {
                $ionicLoading.hide();
                console.log(err.message);
                s.loadingAlert('Ocurrio un error, intente mas tarde.');
            });
    }
    s.horaDesde = '0:0';
    s.horaHasta = '0:0';
    s.reservar = function() {
        s.vehiculo = r.user.perfil.tipoVehiculo;
        s.placa = r.user.perfil.placa;
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
    s.confirmarReserva = function(d) {
        var that = this;
        $ionicLoading.show({
            template: 'Consultando lugares disponibles...'
        });
        Stamplay.Codeblock("consultadisponibilidadparqueo").run({
                pId: s.parqueoSeleccionado._id,
                hD: r.getDateTime(this.$$childHead.horaDesde),
                hH: r.getDateTime(this.$$childHead.horaHasta),
                tV: this.$$childHead.vehiculo
            })
            .then(function(res) {
                $ionicLoading.hide();
                if (res != 'Sin lugar') {
                    var reserva = {
                        "owner": r.user._id,
                        "Usuario": r.user._id,
                        "Parqueo": s.parqueoSeleccionado._id,
                        "Placa": that.$$childHead.placa,
                        "HoraDesde": r.getDateTime(that.$$childHead.horaDesde),
                        "HoraHasta": r.getDateTime(that.$$childHead.horaHasta),
                        "Estado": 'P',
                        "TipoVehiculo": that.$$childHead.vehiculo,
                        "borradoHistorial": false,
                        "puestoParqueo": res,
                        "Monto": (r.formatHora(that.$$childHead.horaHasta) - r.formatHora(that.$$childHead.horaDesde)) * s.montos[that.$$childHead.vehiculo]
                    };
                    s.pagar(reserva);
                } else {
                    s.loadingAlert('No hay lugares disponibles para el horario seleccionado');
                }
            }, function(err) {
                $ionicLoading.hide();
                s.loadingAlert('Ocurrio un error, intente mas tarde.');
            })
    }
    s.limpiarInput = function() {
        this.$parent.direccion = this.direccion = '';
    };
    s.onMapInit = function(map) {
        s.map = map;
        s.centrarMapa();
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
            center: marker.latlng,
            strokeColor: "rgba(98,178,252,0)",
            //strokeOpacity: 0.8,
            //strokeWeight: 2,
            fillColor: "rgba(98,178,252,0.35)",
            //map: s.map,
            radius: s.radioBusqueda // in meters
        };
        if (s.cityCircle) {
            //s.cityCircle.setMap(null);
            s.cityCircle.remove();
        }
        //s.cityCircle = new google.maps.Circle(sunCircle);
        //s.cityCircle.bindTo('center', marker, 'position');
        s.map.addCircle(sunCircle, function(circle) {
            s.cityCircle = circle;
        });
    };
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
        /*$ionicLoading.show({
            template: 'Cargando...'
        });*/
        var options = {
            timeout: 30000,
            enableHighAccuracy: true
        };
        s.location.getCurrentPosition(options).then(function(position) {
            r.lat = position.coords.latitude;
            r.long = position.coords.longitude;
            var latLong = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            //s.map.setCenter(latLong);
            //s.map.setZoom(15);
            s.map.moveCamera({
              'target': latLong,
              'zoom': 15
            });
            /*if (s.markerLocation) {
                s.markerLocation.setMap(null);
            }*/
            s.markerLocation = new CustomMarker(latLong,{});
            s.map.addMarker(s.markerLocation);
            s.circulo(s.markerLocation);
            if (s.markerBusqueda) s.markerBusqueda.remove();
            s.currPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            s.busquedaRealizada = false;
            s.consultarParqueos();
            $ionicLoading.hide();

        }, function(error) {
            console.log(error.message);
        });
    };
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
                    s.map.addMarker({
                        position: new plugin.google.maps.LatLng(coord[1], coord[0]),
                        //map: s.map,
                        //icon: 'img/icon_location_opcion4_celeste.png',
                        array_pos: i
                    }, function(marker){
                        marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function() {
                            s.verParqueo(marker.array_pos);
                          });
                        s.parqueosCercanosMarker.push(marker);
                    });
                }
                $ionicLoading.hide();
            });
    };
    
    s.abierto = false;
    s.verParqueo = function(m) {
        console.log(m);
        s.parqueoSeleccionado = s.parqueosCercanos[m];
        s.coord = s.parqueoSeleccionado._geolocation.coordinates;
        s.parqueoSeleccionado.dias = [false, false, false, false, false, false, false];
        s.valoraciones = s.parqueoSeleccionado.votos ? s.parqueoSeleccionado.votos : 0;
        s.rating = Math.round(s.parqueoSeleccionado.totalVotos ? (s.parqueoSeleccionado.totalVotos / s.valoraciones).toFixed(2) : 0);

        s.montos = [parseFloat(s.parqueoSeleccionado.ValorXHoraL), parseFloat(s.parqueoSeleccionado.ValorXHoraP), parseFloat(s.parqueoSeleccionado.ValorXHoraM)];

        if (s.parqueoSeleccionado.DiasHabiles)
            for (var i = 0; i < s.parqueoSeleccionado.DiasHabiles.length; i++) {
                s.parqueoSeleccionado.dias[s.parqueoSeleccionado.DiasHabiles[i]] = true;
            }
        s.modalDetalle.show();
        s.abierto = s.parqueoSeleccionado.dias[new Date().getDay()];
    };

    s.removeParqueosMarkers = function() {
        for (var i = 0; i < s.parqueosCercanosMarker.length; i++) {
            s.parqueosCercanosMarker[i].remove();
        }
        s.parqueosCercanosMarker = [];
    };
}
function CustomMarker(latlng, args) {
    this.position = this.latlng = latlng;   
    this.args = args;   
}

CustomMarker.prototype = new plugin.google.maps.OverlayView();

CustomMarker.prototype.draw = function() {
    
    var self = this;
    
    var div = this.div;
    
    if (!div) {
        var template = document.createElement('template');
        template.innerHTML = '<div class="ch-container"><div class="ch-item"></div><div class="ch-middle"></div></div>';
        div = this.div = template.content.firstChild;
        div.style.position = 'absolute';
        div.style.cursor = 'pointer';
        div.style.width = '20px';
        div.style.height = '20px';
        if (typeof(self.args.marker_id) !== 'undefined') {
            div.dataset.marker_id = self.args.marker_id;
        }       
        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
    }
    
    var point = this.getProjection().fromLatLngToDivPixel(this.latlng);
    
    if (point) {
        div.style.left = (point.x - 10) + 'px';
        div.style.top = (point.y - 20) + 'px';
    }
};
CustomMarker.prototype.remove = function() {
    if (this.div) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
    }   
};

CustomMarker.prototype.getPosition = function() {
    return this.latlng; 
};