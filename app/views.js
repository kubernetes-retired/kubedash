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

'use strict';

// clusterUtil controls the utilization chart and derived stats of the Cluster page
angular.module('kubedash').controller('clusterUtil', function($scope, $location, $controller) {
  $scope.memUsage = 'api/v1/model/metrics/memory-working?start=';
  $scope.memLimit = 'api/v1/model/metrics/memory-limit?start=';
  $scope.cpuUsage = 'api/v1/model/metrics/cpu-usage?start=';
  $scope.cpuLimit = 'api/v1/model/metrics/cpu-limit?start=';
  $scope.stats = 'api/v1/model/stats';

  $scope.listLink = 'api/v1/model/namespaces/';
  $scope.$location = $location;
  $scope.goTo = function(ns) {
    $scope.$location.path("/namespace/" + ns);
  };
  $controller('ListingController', {$scope: $scope});
  $controller('UtilizationViewController', {$scope: $scope});
});

// nodeUtil controls the utilization chart and derived stats of the Node page.
angular.module('kubedash').controller('nodeUtil', function($scope, $location, $controller, $routeParams) {
  $scope.hostname = $routeParams.name;
  $scope.memUsage = 'api/v1/model/nodes/' + $scope.hostname + '/metrics/memory-working?start=';
  $scope.memLimit = 'api/v1/model/nodes/' + $scope.hostname + '/metrics/memory-limit?start=';
  $scope.cpuUsage = 'api/v1/model/nodes/' + $scope.hostname + '/metrics/cpu-usage?start=';
  $scope.cpuLimit = 'api/v1/model/nodes/' + $scope.hostname + '/metrics/cpu-limit?start=';
  $scope.stats = 'api/v1/model/nodes/' + $scope.hostname + '/stats';

  $scope.listLink = 'api/v1/model/nodes/' + $scope.hostname + '/pods';
  $scope.$location = $location;
  $scope.goTo = function(nspod) {
    var tokens = nspod.split("/")
    $scope.$location.path("/namespace/" + tokens[0] + "/pod/" + tokens[1]);
  };
  $controller('ListingController', {$scope: $scope});
  $controller('UtilizationViewController', {$scope: $scope});
});

// freeContainerListing controls the listing of free containers in the Node page
angular.module('kubedash').controller('freeContainerListing', function($scope, $location, $controller, $routeParams) {
  $scope.hostname = $routeParams.name;
  $scope.$location = $location;
  $scope.listLink = 'api/v1/model/nodes/' + $scope.hostname + '/freecontainers';
  $scope.goTo = function(ctr) {
    $scope.$location.path("/node/" + $scope.hostname + "/freecontainer/" + ctr);
  };
  $controller('ListingController', {$scope: $scope});
});

// namespaceUtil controls the utilization chart and derived stats of the Namespace page.
angular.module('kubedash').controller('namespaceUtil',  
      function($scope, $controller, $http, $routeParams, $location) {
  $scope.ns = $routeParams.name;
  $scope.$location = $location;

  $scope.memUsage = 'api/v1/model/namespaces/' + $scope.ns + '/metrics/memory-working?start=';
  $scope.memLimit = 'api/v1/model/namespaces/' + $scope.ns + '/metrics/memory-limit?start=';
  $scope.memLimitFallback = 'api/v1/model/metrics/memory-limit?start=';
  $scope.cpuUsage = 'api/v1/model/namespaces/' + $scope.ns + '/metrics/cpu-usage?start=';
  $scope.cpuLimit = 'api/v1/model/namespaces/' + $scope.ns + '/metrics/cpu-limit?start=';
  $scope.cpuLimitFallback = 'api/v1/model/metrics/cpu-limit?start=';
  $scope.stats = 'api/v1/model/namespaces/' + $scope.ns + '/stats';
  $controller('UtilizationViewController', {$scope: $scope});

  $scope.listLink = 'api/v1/model/namespaces/' + $scope.ns + '/pods';
  $scope.goTo = function(ns, pod) {
    $scope.$location.path("/namespace/" + ns + "/pod/" + pod);
  };
  $controller('ListingController', {$scope: $scope});
  $controller('UtilizationViewController', {$scope: $scope});
});

// podUtil controls the utilization chart and derived stats of the Pod page.
angular.module('kubedash').controller('podUtil',  
      function($scope, $location, $controller, $routeParams, $http) {

  $scope.ns = $routeParams.namespace;
  $scope.podname = $routeParams.podname;
  var prefix = 'api/v1/model/namespaces/' + $scope.ns + 
          '/pods/' + $scope.podname;

  $scope.memUsage = prefix + '/metrics/memory-working?start=';
  $scope.memLimit = prefix + '/metrics/memory-limit?start=';
  $scope.memLimitFallback = 'api/v1/model/metrics/memory-limit?start=';
  $scope.cpuUsage = prefix + '/metrics/cpu-usage?start=';
  $scope.cpuLimit = prefix + '/metrics/cpu-limit?start=';
  $scope.cpuLimitFallback = 'api/v1/model/metrics/cpu-limit?start=';
  $scope.stats = prefix + '/stats';

  $scope.$location = $location
  $scope.listLink = prefix + '/containers';
  $scope.goTo = function(container) {
    $scope.$location.path("/namespace/" + $scope.ns + "/pod/" + $scope.podname + "/container/" + container);
  };

  $controller('ListingController', {$scope: $scope});
  $controller('UtilizationViewController', {$scope: $scope});
});

// podContainerUtil controls the utilization chart and stats of the Pod Container page.
angular.module('kubedash').controller('podContainerUtil',  
      function($scope, $controller, $routeParams) {

  $scope.ns = $routeParams.namespace;
  $scope.podname = $routeParams.podname;
  $scope.containername = $routeParams.containername;
  $scope.containerPath = $scope.ns + ' / ' + $scope.podname + ' / ' + $scope.containername;

  var prefix = 'api/v1/model/namespaces/' + $scope.ns + '/pods/' + $scope.podname + '/containers/' + $scope.containername;
  $scope.memUsage = prefix + '/metrics/memory-working?start=';
  $scope.memLimit = prefix + '/metrics/memory-limit?start=';
  $scope.memLimitFallback = 'api/v1/model/metrics/memory-limit?start=';
  $scope.cpuUsage = prefix + '/metrics/cpu-usage?start=';
  $scope.cpuLimit = prefix + '/metrics/cpu-limit?start=';
  $scope.cpuLimitFallback = 'api/v1/model/metrics/cpu-limit?start=';
  $scope.stats = prefix + '/stats';
  $controller('UtilizationViewController', {$scope: $scope});
});

// freeContainerUtil controls the utilization chart and stats of the Free Container page.
angular.module('kubedash').controller('freeContainerUtil',  
      function($scope, $controller, $routeParams) {

  $scope.hostname = $routeParams.hostname;
  $scope.containername = $routeParams.containername;
  $scope.containerPath = $scope.hostname + ' / ' + $scope.containername;

  // Populate Containers list
  var prefix = 'api/v1/model/nodes/' + $scope.hostname + '/freecontainers/' + $scope.containername;

  $scope.memUsage = prefix + '/metrics/memory-working?start=';
  $scope.memLimit = prefix + '/metrics/memory-limit?start=';
  $scope.memLimitFallback = 'api/v1/model/metrics/memory-limit?start=';
  $scope.cpuUsage = prefix + '/metrics/cpu-usage?start=';
  $scope.cpuLimit = prefix + '/metrics/cpu-limit?start=';
  $scope.cpuLimitFallback = 'api/v1/model/metrics/cpu-limit?start=';
  $scope.stats = prefix + '/stats';
  $controller('UtilizationViewController', {$scope: $scope});
});


// allNodes controls the view of the node selection page
angular.module('kubedash').controller('allNodes', function($scope, $controller, $location) {
  $scope.listLink = "api/v1/model/nodes/";
  $scope.$location = $location
  $scope.goTo = function(nodename) {
    $scope.$location.path("/node/" + nodename);
  };

  $controller('ListingController', {$scope: $scope});
});

// allNamespaces controls the view of the namespace selection page
angular.module('kubedash').controller('allNamespaces', function($scope, $controller, $location) {
  $scope.listLink = "api/v1/model/namespaces/";
  $scope.$location = $location
  $scope.goTo = function(ns) {
    $scope.$location.path("/namespace/" + ns);
  };
  $controller('ListingController', {$scope: $scope});
});
