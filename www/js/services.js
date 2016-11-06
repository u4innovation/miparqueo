angular.module('MiParqueo.services', [])
    .factory('AccountService', ["$q", AccountService])
    .factory('PayphoneService', ["$q", "$http", PayphoneService]);

function AccountService($q) {
    return {
        currentUser: function() {
            var def = $q.defer();
            Stamplay.User.currentUser()
                .then(function(response) {
                    if (response.user === undefined) {
                        def.resolve(false);
                    } else {
                        def.resolve(response.user);
                    }
                }, function(error) {
                    def.reject();
                })
            return def.promise;
        }
    }
}

function PayphoneService($q, $http) {
    return {
        pay: function(cc, tel, monto, lat, long) {
            var def = $q.defer();
            var impuesto = (monto * 0.14);
            var a = {
                phoneNumber: tel,
                countryCode: cc,
                monto: (monto + impuesto) * 100,
                montoSinImpuesto: 0,
                montoConImpuesto: monto * 100,
                impuesto: impuesto * 100,
                lat: lat,
                long: long
            }

            $http.post(
                    'http://localhost:8888/SetAndSendTransaction.php',
                    a, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })
                .then(
                    function(data) {
                        def.resolve(data);
                    },
                    function(data) {
                        def.reject(data);
                    });
            return def.promise;
        }
    }
}