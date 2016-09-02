angular.module('MiParqueo').controller('AppCtrl', function($ionicModal, AccountService, $state, $scope, $rootScope, $ionicLoading, $ionicPopup, socialProvider, $timeout) {

$rootScope.loginData = {};
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.modal = modal;
        });
        $rootScope.closeLogin = function() {
            $rootScope.modal.hide();
        };
        $rootScope.showLogin = function() {
            $rootScope.modal.show();
        };
        $rootScope.login = function(i) {
            Stamplay.User.socialLogin(socialProvider[i])
        };

        $rootScope.logout = function() {
            $ionicLoading.show();
            var jwt = window.location.origin + "-jwt";
            window.localStorage.removeItem(jwt);
            AccountService.currentUser()
                .then(function(user) {
                    $rootScope.user = user;
                    $rootScope.showLogin();
                    $ionicLoading.hide();
                }, function(error) {
                    console.error(error);
                    $ionicLoading.hide();
                    $state.go($state.current, {}, {reload: true});
                })
        }
        //$rootScope.user = {"_id":"57b7ac4fe1af8c0434720491","appId":"miparqueo","displayName":"Gonzalo Aller","name":{"familyName":"Aller","givenName":"Gonzalo"},"pictures":{"facebook":"https://graph.facebook.com/10210477627084919/picture"},"givenRole":"57af24c32e101f405ecebd4a","email":"gonzaller@me.com","identities":{"facebook":{"facebookUid":"10210477627084919","_json":{"timezone":-3,"first_name":"Gonzalo","last_name":"Aller","locale":"es_LA","picture":{"data":{"url":"https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13322155_10209828060006148_4865973369382732877_n.jpg?oh=44baf6b5e046137288fd83c114b491d0&oe=5856DB75","is_silhouette":false}},"link":"https://www.facebook.com/app_scoped_user_id/10210477627084919/","gender":"male","email":"gonzaller@me.com","age_range":{"min":21},"name":"Gonzalo Aller","id":"10210477627084919"},"emails":[{"value":"gonzaller@me.com"}],"accessToken":"EAAIjuROBonoBAPZA6EgZCsmhgJZC7OdA2sTOnDXxTijYRmMPpgCgn3eBx2p9msnBO6UZAGrM6HOZBDLxBqkSz16WeuWDvzKMiQCWAEXpNEpDDaNfd3FOabVQ1nZCo3xrZCfOD5MtgLy6Io8ZBArZCukjuj86T1dXzCSgZD"}},"__v":0,"dt_update":"2016-08-28T23:28:18.400Z","dt_create":"2016-08-20T01:03:11.170Z","emailVerified":true,"verificationCode":"907089e2acc08ad816d3","profileImg":"https://graph.facebook.com/10210477627084919/picture","id":"57b7ac4fe1af8c0434720491"};
        AccountService.currentUser()
            .then(function(user) {
                if (user || $rootScope.user) {
                    $rootScope.user = user ? user : $rootScope.user;
                     Stamplay.Object("usuarios").get({
                        owner: $rootScope.user._id
                    })
                      .then(function(res) {
                        $rootScope.user.perfil = res.data[0];
                      }, function(err) {
                        // Error
                      });
                } else {
                    $rootScope.showLogin();
                }
            })

})
    .controller('PerfilCtrl', function($scope, $rootScope, $ionicLoading) {
        $scope.guardar = function(){
            $ionicLoading.show({
                    template: 'Actualizando...'
                });
            Stamplay.Object("usuarios").patch($rootScope.user.perfil._id, $rootScope.user.perfil)
            .then(function(res) {
              // success
              $ionicLoading.hide();
            }, function(err) {
              // error
            })
        }
    })
    .controller('HistorialCtrl', ['$scope', '$rootScope', '$ionicLoading', '$timeout', '$ionicModal', '$ionicLoading',
        function(s, rt, $ionicLoading, $timeout, $ionicModal, $ionicLoading) {
            // With Promise
            s.$on('$ionicView.afterEnter', function() {
                if (rt.user)
                    s.getHistorial();
            });
            s.getHistorial = function() {
                $ionicLoading.show({
                    template: 'Buscando...'
                });
                Stamplay.Object("reservas")
                    .get({
                        owner: rt.user._id,
                        populate: true,
                        sort: "-dt_create"
                    })
                    .then(function(res) {
                        s.historial = res.data;
                        $ionicLoading.hide();
                    }, function(err) {

                    });
            }

            function padLeft(nr, n, str) {
                return Array(n - String(nr).length + 1).join(str || '0') + nr;
            }
            s.estadia = function(i) {
                var desde = new Date(i.HoraDesde);
                var hasta = new Date(i.HoraHasta);
                return desde.getHours() + ':' + (desde.getMinutes() == 0 ? '00' : '30') + ' - ' + hasta.getHours() + ':' + (hasta.getMinutes() == 0 ? '00' : '30') + '  |  ' + desde.getDate() + '/' + desde.getMonth() + '/' + desde.getFullYear();
            }
            s.horaDesde = '0:0';
            s.horaHasta = '0:0';
            s.reservar = function(x) {
                s.vehiculo = rt.user.perfil.tipoVehiculo;
                s.placa = rt.user.perfil.placa;
                s.parqueoSeleccionado = x.Parqueo[0];
                s.parqueoSeleccionado.dias = [false, false, false, false, false, false, false];
                s.rating = s.parqueoSeleccionado.actions.ratings.avg;
                s.valoraciones = s.parqueoSeleccionado.actions.ratings.total;
                s.montos = [parseFloat(s.parqueoSeleccionado.ValorXHoraL), parseFloat(s.parqueoSeleccionado.ValorXHoraP), parseFloat(s.parqueoSeleccionado.ValorXHoraM)];

                if (s.parqueoSeleccionado.DiasHabiles) {
                    for (var i = 0; i < s.parqueoSeleccionado.DiasHabiles.length; i++) {
                        s.parqueoSeleccionado.dias[s.parqueoSeleccionado.DiasHabiles[i]] = true;
                    }
                }
                s.hai = (x.Parqueo[0].HoraApertura + '').split('.')[0];
                s.hci = (x.Parqueo[0].HoraCierre + '').split('.')[0];
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
                    "Monto": (r.formatHora(this.$$childHead.horaHasta) - r.formatHora(this.$$childHead.horaDesde)) * s.montos[this.$$childHead.vehiculo]
                };
                Stamplay.Object("reservas")
                    .save(reserva)
                    .then(function(res) {
                        s.modalReserva.remove().then(function() {
                            $ionicLoading.hide();
                            s.getHistorial();
                        });
                    }, function(err) {
                        // Handle Error
                    });
            }
        }
    ])
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
    });