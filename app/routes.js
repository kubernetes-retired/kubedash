// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


angular.module('kubedash').config(['$locationProvider', '$routeProvider', 
        function($locationProvider, $routeProvider) {
  // html5Mode allows angular to edit the browser history, 
  // thus allowing back/forward transitions for a single-page app
  $locationProvider.html5Mode(true);

  $routeProvider
      // route for the Cluster page
      .when('/', {
        templateUrl : 'pages/cluster.html',
        controller : 'clusterUtil',
      })

      // route for the Nodes page
      .when('/nodes/', {
        templateUrl : 'pages/nodes.html',
        controller : 'allNodes',
      })
	  
      // route for each individual Node page
      .when('/node/:name', {
        templateUrl : 'pages/node.html',
        controller : 'nodeUtil',
      })

      // route for the Namespaces page
      .when('/namespaces/', {
        templateUrl : 'pages/namespaces.html',
        controller : 'allNamespaces',
      })

      // route for each individual Namespace Page
      .when('/namespace/:name', {
        templateUrl : 'pages/namespace.html',
        controller : 'namespaceUtil',
      })

      .otherwise({
        redirectTo: '/'
      });
}]);


angular.module('kubedash').run(function($rootScope) {
  $rootScope.$on('$routeChangeStart', function(event, next, current) {

    // Performs cleanup of all nvd3 charts before route change.
    if (typeof(current) !== 'undefined'){
      d3.selectAll('svg').remove();
      nv.charts = {};
      nv.graphs = [];
      nv.logs = {};

      // Remove Window Resize Listeners.
      window.onresize = null;
    }
  });

  // Stubs for global Alerts under $rootScope
  $rootScope.alerts = []

  $rootScope.addAlert = function (message) {
    $rootScope.alerts.push({msg: message});
  }

  $rootScope.closeAlert = function(index) {
    $rootScope.alerts.splice(index, 1);
  }

});
