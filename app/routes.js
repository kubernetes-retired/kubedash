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


angular.module('kubedash').config(['$locationProvider', '$routeProvider', '$provide',
    function($locationProvider, $routeProvider, $provide) {

      // The sniffer decorator enables hashbang compatibility in older browsers,
      // while html5 history rewriting mode is enabled.
      $provide.decorator('$sniffer', function($delegate) {
        $delegate.history = false;
        return $delegate;
      });
      $locationProvider.html5Mode(true).hashPrefix('!');

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

      // route for each individual Pod Page
      .when('/namespace/:namespace/pod/:podname', {
        templateUrl : 'pages/pod.html',
        controller : 'podUtil',
      })

      // route for each individual Pod Container Page
      .when('/namespace/:namespace/pod/:podname/container/:containername', {
        templateUrl : 'pages/container.html',
        controller : 'podContainerUtil',
      })

      .otherwise({
        redirectTo: '/'
      });
    }]);


angular.module('kubedash').run(function($rootScope) {
  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    // Performs cleanup of all nvd3 charts during routing changes.
    if (typeof(current) !== 'undefined'){
      d3.selectAll('svg').remove();
      nv.charts = {};
      nv.graphs = [];
      nv.logs = {};

      // Remove Window Resize Listeners.
      window.onresize = null;
    }
  });

  // Initial version of notification stubs, bound to $rootScope
  $rootScope.alerts = []

  $rootScope.addAlert = function (message) {
    $rootScope.alerts.push({msg: message});
  }

  $rootScope.closeAlert = function(index) {
    $rootScope.alerts.splice(index, 1);
  }
});
