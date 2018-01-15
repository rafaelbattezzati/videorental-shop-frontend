var app = angular.module('videoRentalStoreApp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.when('/addFilms', {
        controller: 'ManageFilmsController',
        templateUrl: 'templates/addFilms.html'
    }).when('/addFilms/:id', {
        controller: 'ManageFilmsController',
        templateUrl: 'templates/addFilms.html'
    }).when('/listFilms', {
        controller: 'ListFilmsController',
        templateUrl: 'templates/listFilms.html'
    }).when('/rentFilms', {
        controller: 'ListItemFilmsController',
        templateUrl: 'templates/rentFilms.html'
    }).when('/rentFilms/:id', {
        controller: 'RentFilmsController',
        templateUrl: 'templates/rentFilmsForm.html'
    }).when('/basket', {
        controller: 'BasketController',
        templateUrl: 'templates/basket.html'
    }).when('/findClient', {
        controller: 'ClientController',
        templateUrl: 'templates/findClient.html'
    }).when('/returnFilms/:id', {
        controller: 'OrderController',
        templateUrl: 'templates/returnFilms.html'
    }).when('/returnFilmForm/:id', {
        controller: 'OrderController',
        templateUrl: 'templates/returnFilmForm.html'
    }).when('/listOpenRents', {
        controller: 'ListOpenOrdersController',
        templateUrl: 'templates/listOpenRents.html'
    }).when('/listReturnedRents', {
        controller: 'ListReturnedOrdersController',
        templateUrl: 'templates/listReturnedRents.html'
    }).otherwise('/listFilms');
})

app.factory("MyFactory", function () {
    var savedOrderData = {};
    var savedClientData = {};
    function setOrder(data){
        savedOrderData = data;
    }
    function getOrder() {
        return savedOrderData;
    }

    function setClient(data){
        savedClientData = data;
    }
    function getClient() {
        return savedClientData;
    }
    return{
        setOrder: setOrder,
        getOrder: getOrder,
        setClient: setClient,
        getClient: getClient
    }
})


app.controller('BasketController', function ($scope, $route, $location, BasketService) {

    basketController();

    function basketController() {

        $scope.filmBasketList = [];
        if(localStorage.getItem("itens")){
            $scope.filmBasketList = JSON.parse(localStorage.getItem("itens"));
        }

        $scope.removeFilm = function (itemFilm) {
            $scope.filmBasketList.splice(itemFilm, 1);
            $scope.$parent.total = $scope.$parent.total - itemFilm.expectedPrice;
            localStorage.setItem("itens", JSON.stringify($scope.filmBasketList));
            $route.reload();
        }
    }

    function saveAll(){
        $scope.filmBasketList = [];
        if(localStorage.getItem("itens")){
            $scope.filmBasketList = JSON.parse(localStorage.getItem("itens"));
            localStorage.setItem("itens", JSON.stringify($scope.filmBasketList));
        }
        return BasketService.saveAll(localStorage.getItem("itens"));
    }

    $scope.saveAll = function () {
        alert("Film rented successfully!");
        saveAll().then(redirectListAllFilms);
    }

    function redirectListAllFilms(){
        $scope.filmBasketList = [];
        localStorage.setItem("itens", JSON.stringify($scope.filmBasketList));
        $location.path('/rentFilms');
    }

});

app.controller('ListFilmsController', function ($scope, FilmService) {

    $scope.film = {};
    getFilms();

    function getFilms() {
        FilmService.getFilms().then(function (resposta) {
            $scope.films = resposta.data;
        });
    }

    $scope.remove = function (film) {
        FilmService.remove(film).then(getFilms);
        $scope.film = {};
    }
});

app.controller('ListItemFilmsController', function ($scope, ItemFilmsService) {
    $scope.itemFilms = {};
    getAllItemFilms();

    function getAllItemFilms() {
        ItemFilmsService.getAllItemFilms().then(function (resposta) {
            $scope.itemFilms = resposta.data;
        });
    }
});

app.controller('ManageFilmsController', function ($routeParams, $scope, $location, FilmService) {

    var id = $routeParams.id;
    if(id){
        FilmService.getFilm(id).then(function (resposta) {
            $scope.film = resposta.data;
        })
    } else {
        $scope.film = {};
    }

    $scope.film = {};
    getAllFilmPriceType();

    function getAllFilmPriceType() {
        FilmService.getAllFilmPriceType().then(function (respostaa) {
            $scope.allFilmPriceType = respostaa.data;
        });
    }

    function save(film){
        $scope.film = {};
        return FilmService.save(film);
    }

    function redirectListFilms(){
        $location.path('/listFilms');
    }

    $scope.save = function (film) {
        save(film).then(redirectListFilms);
    }

    $scope.saveAndContinue = save;
    $scope.cancel = redirectListFilms;

});

app.controller('RentFilmsController', function ($routeParams, $scope, $location, RentFilmsService, FilmService) {
    $scope.itemFilm = {};
    $scope.itemFilm.startRentDate = new Date();
    $scope.itemFilm.expectedEndRentDate = new Date();
    $scope.itemFilm.expectedEndRentDate.setDate($scope.itemFilm.expectedEndRentDate.getDate() + 1);
    $scope.filmRentList = {};
    basketController();

    var id = $routeParams.id;
    if(id){
        FilmService.getFilm(id).then(function (resposta) {
            $scope.itemFilm.film = resposta.data;
        })
    } else {
        $scope.itemFilm.film = {};
    }

    getRentsByFilm(id);

    function getRentsByFilm(id){
        RentFilmsService.getListOfRent(id).then(function (respostaa) {
            $scope.filmRentList = respostaa.data;
        })
    }

    function save(itemFilm){
        $scope.itemFilm = itemFilm;
        return RentFilmsService.save(itemFilm);
    }

    function redirectListFilms(){
        $location.path('/rentFilms');
    }

    $scope.save = function (itemFilm) {
        alert("Film rented successfully!");
        save(itemFilm).then(redirectListFilms);
    }

    $scope.cancel = redirectListFilms;

    function basketController() {
        $scope.filmBasketList = [];
        if(localStorage.getItem("itens")){
            $scope.filmBasketList = JSON.parse(localStorage.getItem("itens"));
        }

        $scope.addFilm = function (itemFilm) {
            if (itemFilm != null) {
                var dayDif = (itemFilm.expectedEndRentDate - itemFilm.startRentDate)  / 1000 / 60 / 60 / 24;
                itemFilm.daysBetween = dayDif;
                itemFilm.expectedPrice = itemFilm.film.filmPriceType.price * itemFilm.daysBetween;
                $scope.filmBasketList.push(itemFilm);
            }
            localStorage.setItem("itens", JSON.stringify($scope.filmBasketList));
            alert("Film added in the basket!!!");
            redirectListFilms();
        };
    }

});

app.controller('ClientController', function ($scope, $location, ClientService) {
    $scope.client = {};

    function findClient(client) {
        var name = client.name;
        var lastName = client.lastName;
        if (name != null) {
            ClientService.getClientByName(name).then(function (resposta) {
                $scope.clientList = resposta.data;
            })
        } else if (lastName != null) {
            ClientService.getClientByLastName(lastName).then(function (resposta) {
                $scope.clientList = resposta.data;
            })
        } else {
            ClientService.getClientList().then(function (resposta) {
                $scope.clientList = resposta.data;
            })
        }
    }

    $scope.findClient = function (client) {
        findClient(client);
    }

    function redirectFindClient(){
        $scope.client = {};
        $location.path('/findClient');
    }

    $scope.clear = redirectFindClient;

});

app.controller('OrderController', function ($scope, $routeParams, $location, OrderService, ClientService, MyFactory) {
    $scope.order  = MyFactory.getOrder();
    $scope.client = MyFactory.getClient();

    var id = $routeParams.id;
    if(id){
        getOrdersByClient(id);
    }

    function getOrdersByClient(id) {
        OrderService.getOrdersByClient(id).then(function (resposta) {
            $scope.ordersList = resposta.data;
        })
        ClientService.getClientById(id).then(function (resposta) {
            $scope.client = resposta.data;
            MyFactory.setClient($scope.client);
        })
    }

    $scope.returnFilm = function (order) {
        MyFactory.setOrder(order);
        $location.path('/returnFilmForm/'+id);
    }

    $scope.cancel = redirectReturnFilms;

    function endRent(order){
        $scope.order = order;
        return OrderService.save(order).then(getOrdersByClient(id));
    }


    $scope.endRent = function (order) {
        alert("Order finished!");
        endRent(order).then(redirectReturnFilms);
    }

    function redirectReturnFilms(){
        $location.path('/returnFilms/'+id);
    }

});

app.controller('ListOpenOrdersController', function ($scope, OrderService) {

    getOrders();

    function getOrders() {
        OrderService.getOpenOrders().then(function (resposta) {
            $scope.orders = resposta.data;
        });
    }

});


app.controller('ListReturnedOrdersController', function ($scope, OrderService) {

    getOrders();

    function getOrders() {
        OrderService.getReturnedOrders().then(function (resposta) {
            $scope.orders = resposta.data;
        });
    }

});

app.service('FilmService', function ($http) {

    var api = 'http://localhost:8080/films';

    this.getFilms = function () {
        return $http.get(api);
    }

    this.getFilm = function(id){
        return $http.get(api + '/' + id);
    };

    this.getAllFilmPriceType = function () {
        return $http.get(api + '/getAllFilmPriceType');
    }

    this.save = function (film) {
        if(film.id) {
            return $http.put(api + '/' + film.id, film);
        } else {
            return $http.post(api, film);
        }
    }

    this.remove = function (film) {
        return $http.delete(api + '/' + film.id);
    }

});

app.service('RentFilmsService', function ($http) {

    var api = 'http://localhost:8080/rent';

    this.save = function (itemFilm) {
        return $http.post(api, itemFilm);
    }

    this.getListOfRent = function (id) {
        return $http.get(api + '/' + id);
    }

});

app.service('BasketService', function ($http) {

    var api = 'http://localhost:8080/rent/rentAll';

    this.saveAll = function (filmBasketList) {
        return $http.post(api, filmBasketList);
    }

});

app.service('ItemFilmsService', function ($http) {

    var api = 'http://localhost:8080/rent';

    this.getAllItemFilms = function () {
        return $http.get(api);
    }

    this.save = function (film) {
        if(film.id) {
            return $http.put(api + '/' + film.id, film);
        } else {
            return $http.post(api, film);
        }
    }

});

app.service('ClientService', function ($http) {

    var api = 'http://localhost:8080/client';

    this.getClientById = function (id) {
        return $http.get(api + '/' + id);
    }

    this.getClientByName = function (name) {
        return $http.get(api + '/findClientByName/' + name);
    }

    this.getClientByLastName = function (lastName) {
        return $http.get(api + '/findClientByLastName/' + lastName);
    }

    this.getClientList = function () {
        return $http.get(api);
    }

});

app.service('OrderService', function ($http) {
    var api = 'http://localhost:8080/orders';

    this.getOrdersByClient = function (id) {
        return $http.get(api + '/ordersByClient/' + id);
    }

    this.save = function (order) {
        return $http.put(api, order);
    }

    this.getOpenOrders = function (id) {
        return $http.get(api + '/open');
    }

    this.getReturnedOrders = function (id) {
        return $http.get(api + '/returned');
    }

});
