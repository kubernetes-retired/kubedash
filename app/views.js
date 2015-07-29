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
angular.module('kubedash').controller('clusterUtil', function($scope, $controller) {
  $scope.memUsage = 'api/v1/model/metrics/memory-working?start=';
  $scope.memLimit = 'api/v1/model/metrics/memory-limit?start=';
  $scope.cpuUsage = 'api/v1/model/metrics/cpu-usage?start=';
  $scope.cpuLimit = 'api/v1/model/metrics/cpu-limit?start=';
  $scope.stats = 'api/v1/model/stats';
  $controller('UtilizationViewController', {$scope: $scope});
});

// nodeUtil controls the utilization chart and derived stats of the Node page.
angular.module('kubedash').controller('nodeUtil', function($scope, $controller, $routeParams) {
  $scope.hostname = $routeParams.name;
  $scope.memUsage = 'api/v1/model/nodes/' + $scope.hostname + '/metrics/memory-working?start=';
  $scope.memLimit = 'api/v1/model/nodes/' + $scope.hostname + '/metrics/memory-limit?start=';
  $scope.cpuUsage = 'api/v1/model/nodes/' + $scope.hostname + '/metrics/cpu-usage?start=';
  $scope.cpuLimit = 'api/v1/model/nodes/' + $scope.hostname + '/metrics/cpu-limit?start=';
  $scope.stats = 'api/v1/model/nodes/' + $scope.hostname + '/stats';
  $controller('UtilizationViewController', {$scope: $scope});
});

// namespaceUtil controls the utilization chart and derived stats of the Namespace page.
angular.module('kubedash').controller('namespaceUtil',  
      function($scope, $controller, $http, $routeParams) {
        
  $scope.ns = $routeParams.name;

  // Populate Pods list
  $scope.items = [];
  var nsPods = 'api/v1/model/namespaces/' + $scope.ns + '/pods';
  $http.get(nsPods).success(function(data) {
    if (data.length == 0) {
      // No Nodes are available, postpone
      return;
    }
    $scope.items = data;
  });

  $scope.memUsage = 'api/v1/model/namespaces/' + $scope.ns + '/metrics/memory-working?start=';
  $scope.memLimit = 'api/v1/model/namespaces/' + $scope.ns + '/metrics/memory-limit?start=';
  $scope.memLimitFallback = 'api/v1/model/metrics/memory-limit?start=';
  $scope.cpuUsage = 'api/v1/model/namespaces/' + $scope.ns + '/metrics/cpu-usage?start=';
  $scope.cpuLimit = 'api/v1/model/namespaces/' + $scope.ns + '/metrics/cpu-limit?start=';
  $scope.cpuLimitFallback = 'api/v1/model/metrics/cpu-limit?start=';
  $scope.stats = 'api/v1/model/namespaces/' + $scope.ns + '/stats';
  $controller('UtilizationViewController', {$scope: $scope});
});

// podUtil controls the utilization chart and derived stats of the Pod page.
angular.module('kubedash').controller('podUtil',  
      function($scope, $controller, $routeParams, $http) {

  $scope.ns = $routeParams.namespace;
  $scope.podname = $routeParams.podname;
  var prefix = 'api/v1/model/namespaces/' + $scope.ns + 
          '/pods/' + $scope.podname;

  // Populate Containers list
  self.items = [];
  $scope.items = [];
  var podContainers = prefix + '/containers';
  $http.get(podContainers).success(function(data) {
    if (data.length == 0) {
      // No Nodes are available, postpone
      return;
    }
    $scope.items = data;
  });

  $scope.memUsage = prefix + '/metrics/memory-working?start=';
  $scope.memLimit = prefix + '/metrics/memory-limit?start=';
  $scope.memLimitFallback = 'api/v1/model/metrics/memory-limit?start=';
  $scope.cpuUsage = prefix + '/metrics/cpu-usage?start=';
  $scope.cpuLimit = prefix + '/metrics/cpu-limit?start=';
  $scope.cpuLimitFallback = 'api/v1/model/metrics/cpu-limit?start=';
  $scope.stats = prefix + '/stats';
  $controller('UtilizationViewController', {$scope: $scope});
});


// podContainerUtil controls the utilization chart and stats of the Pod Container page.
angular.module('kubedash').controller('podContainerUtil',  
      function($scope, $controller, $routeParams) {

  $scope.ns = $routeParams.namespace;
  $scope.podname = $routeParams.podname;
  $scope.containername = $routeParams.containername;
  $scope.containerPath = $scope.ns + ' / ' + $scope.podname + ' / ' + $scope.containername;

  // Populate Containers list
  self.items = [];
  $scope.items = [];
  var prefix = 'api/v1/model/namespaces/' + $scope.ns + 
          '/pods/' + $scope.podname + '/containers/' + $scope.containername;

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
// TODO(afein): sort by usage/utilization
angular.module('kubedash').controller('allNodes', ['$scope', '$http', function($scope, $http) {
  $scope.items = [];
  var allNodes = "api/v1/model/nodes/";
  $http.get(allNodes).success(function(data) {
    if (data.length == 0) {
      // No Nodes are available, postpone
      return;
    }
    $scope.items = data;
  });
}]);

// allNamespaces controls the view of the namespace selection page
// TODO(afein): sort by usage/utilization
angular.module('kubedash').controller('allNamespaces', function($scope, $http) {
  $scope.items = [];
  var allNamespaces = "api/v1/model/namespaces/";
  $http.get(allNamespaces).success(function(data) {
    if (data.length == 0) {
      // No Nodes are available, postpone
      return;
    }
    $scope.items = data;
  });
});
