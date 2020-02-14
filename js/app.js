const app = angular.module('movieApp', ['ngRoute'])
    .controller('movieCtrl', ['$scope', '$location', 'loadResources', function($scope, $location, loadAResources) {
        $scope.moviesCount = 0;
        $scope.seriesCount = 0;
        $scope.gamesCount = 0;
        $scope.searchText = '';
        $scope.tabType = 'movie';
        $scope.sortReverse = false;
        $scope.grid = true;
        $scope.selectedResource = null;
        $scope.changeView = function() {
            $scope.grid = !$scope.grid;
        }
        $scope.refresh = function() {
            refresh();
        }
        $scope.clear = function() {
            $scope.searchText = '';
        }
        $scope.sort = function() {
            $scope.sortReverse = !$scope.sortReverse;
        };
        $scope.orderSorter = function(res) {
            return res.Title;
        };
        $scope.redirectResource = function(res) {
            $scope.selectedResource = res;
            $location.path("/resource");
        };

        function refresh() {
            loadAResources.LoadAll().then(function(data) {
                $scope.moviesCount = 0;
                $scope.seriesCount = 0;
                $scope.gamesCount = 0;
                $scope.searchText = '';
                $scope.resources = data.data.results;
                $scope.resources.forEach(function(resource) {
                    if (resource.Type == 'movie') $scope.moviesCount++;
                    else if (resource.Type == 'series') $scope.seriesCount++;
                    else if (resource.Type == 'game') $scope.gamesCount++;
                    resource.imageAvailable = false;
                    const img = new Image();
                    img.onload = function() {
                        resource.imageAvailable = true;
                        $scope.$apply()
                    };
                    img.onerror = function() {
                        $scope.$apply()
                    };
                    if (resource.Poster && resource.Poster != '' && resource.Poster != 'N/A')
                        img.src = resource.Poster;
                });
            }, function(response) {
                console.log('Error: ', response);
            });
        }
        refresh();
    }])
    .service('loadResources', function($http) {
        return {
            LoadAll: function() {
                return $http.get('data/resources.json');
            },
            Update: function(res) {
                return $http.post('data/resources.json', { imdb: res.imdb, title: res.title })
                    .then(
                        function() { console.log('update successful') },
                        function() { console.log('update failed') }
                    );
            }
        };

    })
    .filter('typeFilter', function() {
        return function(resources, tabType) {
            if (resources) {
                return resources.filter(function(resource) {
                    if (resource.Type == tabType)
                        return resource;
                });
            }

        };
    })
    .filter('titleFilter', function() {
        return function(resources, text) {
            if (resources) {
                return resources.filter(function(resource) {
                    if (text == '' || resource.Title.search(new RegExp(text, "i")) != -1 || resource.Year.search(new RegExp(text, "i")) != -1)
                        return resource;
                });
            }

        };
    })
    .config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            //requireBase: false
        });
        $routeProvider
            .when("/", {
                templateUrl: "views/main.html"
            })
            .when("/resource", {
                templateUrl: "views/resource.html"
            })
            .otherwise({
                templateUrl: "views/main.html"
            })

    });

app.controller('itemController', function($scope, loadResources) {
    $scope.showInput = false;
    $scope.titleInput = $scope.$parent.r.Title;
    $scope.checkUpdate = function() {
        if ($scope.$parent.r.Title != $scope.titleInput) {
            $scope.$parent.r.Title = $scope.titleInput;
            loadResources.Update({ imbd: $scope.$parent.r.imdbID, title: $scope.titleInput });
        }
        $scope.showInput = false;
    };
});