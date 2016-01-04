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

// Nav bar underlining of clicked links
var cleanAll = function() {
  $("#clusterbutton").removeClass("active");
  $("#nodesbutton").removeClass("active");
  $("#namespacesbutton").removeClass("active");
};

$(document).ready(function() {
  $("#clusterbutton").click(function() {
    cleanAll();
    $("#clusterbutton").addClass("active");
  });

  $("#nodesbutton").click(function() {
    cleanAll();
    $("#nodesbutton").addClass("active");
  });

  $("#namespacesbutton").click(function() {
    cleanAll();
    $("#namespacesbutton").addClass("active");
  });
});


// Generic Controllers - Inherited by controllers in views.js
angular.module('kubedash').controller('ChartViewController', 
    function($scope, $interval) {
      $scope.options = {
        chart: {
          type: 'lineChart',
          height: 400,
          margin : {
            top: 20,
            right: 20,
            bottom: 60,
            left: 40
          },
          transitionDuration: 500,
          useInteractiveGuideline: true,
          lines: {
            forceY: [0, 1],
          },
          color: ['#31708f', '#a94442'],  // light blue, light red
          xAxis: {
            axisLabel: 'Time',
            tickFormat: function(d) {
              return d3.time.format('%X')(new Date(d));
            },
            staggerLabels:true
          },
          yAxis: {
            axisLabel: 'Utilization',
            tickFormat: function(d) {
              return d3.format('%')(d3.round(d, 3));
            }
          },
          title: {
            enable: true,
            text: "Utilization"
          }
        }
      };

      $scope.stamp = (new Date(0)).toISOString();
      $scope.run = true;

      // Poll for new data every 30 seconds
      $scope.pollPromise = $interval($scope.poll, 30000);

      // Trigger the first poll as soon as content is loaded
      $scope.$watch('$viewContentLoaded', $scope.poll);

      $scope.$on('$destroy', function () {
        $interval.cancel($scope.pollPromise);
        $scope.items = [];
      });
    });

angular.module('kubedash').controller('UtilizationViewController', 
    function($scope, $controller, $http, $rootScope) {

      $scope.data = [{key: 'Memory Utilization', area: true, values:[]}];
      $scope.data.push({key: 'CPU Utilization', area: true, values:[]});
      $scope.messages = [];

      var memLimit = $scope.memLimit;
      var cpuLimit = $scope.cpuLimit;

      // Initialize the last limit values
      $scope.lastMemLimit = 0;
      $scope.lastCPULimit = 0;

      var define_poll = function () {
        $scope.limitDecided = true;
        $scope.poll = function() {
          pollUtilization($scope.memUsage, memLimit, $scope, 0, "lastMemLimit", $http, function(limit) {
            return Math.round(limit / 1048576);
          });
          pollUtilization($scope.cpuUsage, cpuLimit, $scope, 1, "lastCPULimit", $http, function(x){return x;});
          pollStats($scope.stats, $scope, $http);
        };
      }

      // Populate scope.poll only if the limit is sane, compared to the usage.
      // Otherwise, use the fallback limit.
      if ((!$scope.memLimitFallback) && (!$scope.cpuLimitFallback)) {
        define_poll();
        $controller('ChartViewController', {$scope: $scope});
        return;
      } 

      testLimitToUsageRatio($scope.memUsage, $scope.memLimit, $http, function() {
        memLimit = $scope.memLimitFallback;
        if ($scope.messages.length == 0) {
          $scope.messages.push("This entity does not have a memory limit, the node's memory limit is shown instead");
        }
      }, function() {
        testLimitToUsageRatio($scope.cpuUsage, $scope.cpuLimit, $http, function() {
          cpuLimit = $scope.cpuLimitFallback;
          if ($scope.messages.length <= 2) {
            $scope.messages.push("This entity does not have a CPU limit, the cluster's CPU limit is shown instead");
          }
        }, function() {
          define_poll();
          $controller('ChartViewController', {$scope: $scope});
        });
      });

    });

function testLimitToUsageRatio(usageLink, limitLink, $http, change_callback, next_callback) {
  var stamp = (new Date(0)).toISOString();
  var usage = 0
      var limit = 0
      $http.get(usageLink + stamp)
      .success(function(data) {
        if ((data.metrics == undefined) || (data.metrics.length < 1)) {
          // No metrics are available, postpone
          setTimeout(function() {
            testLimitToUsageRatio(usageLink, limitLink, $http, change_callback, next_callback);
          }, 5000);
          return;
        }

        usage = data.metrics[data.metrics.length - 1].value;

        $http.get(limitLink + stamp)
            .success(function(data) {
              if ((data.metrics == undefined) || (data.metrics.length < 1)) {
                // No metrics are available, postpone
                setTimeout(function() {
                  testLimitToUsageRatio(usageLink, limitLink, $http, change_callback, next_callback);
                }, 5000);       
                return;
              }

              limit = data.metrics[data.metrics.length - 1].value;

              // The limit is invalid if it's 0, or less than 0.001% of a given non-zero usage
              if (((usage > 0) && (usage < limit/1000)) || (limit == 0)) {
                change_callback();
              }
              next_callback();
            });
      });
}

// secondsToDHMS converts a number of seconds to a string
// formatted as "3d 21h 5m 34s"
function secondsToDHMS(totalSeconds) {
  var days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 3600;
  var hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = totalSeconds % 60;
  var res = ""
  if (days > 0) {
    res += days.toString() + "d "
  }
  res += hours.toString() + "h " + minutes.toString() + "m " + seconds.toString() + "s"
  return res
}

// pollStats appends the derived stats for cpu and memory to $scope.
function pollStats(statsLink, $scope, $http){
  if (!$scope.run) return;
  $http.get(statsLink).success(function(data) {
    if (!data || !("uptime" in data) || !(data["stats"]["memory-working"])) {
      // Empty Stats
      return;
    }
    $scope.uptime = secondsToDHMS(data["uptime"]);
    $scope.cpu = data["stats"]["cpu-usage"]; $scope.mem = data["stats"]["memory-working"];
    $scope.mem.minute.average = Math.round($scope.mem.minute.average / 1048576)
    $scope.mem.minute.percentile = Math.round($scope.mem.minute.percentile / 1048576)
    $scope.mem.minute.max = Math.round($scope.mem.minute.max / 1048576)
    $scope.mem.hour.average = Math.round($scope.mem.hour.average / 1048576)
    $scope.mem.hour.percentile = Math.round($scope.mem.hour.percentile / 1048576)
    $scope.mem.hour.max = Math.round($scope.mem.hour.max / 1048576)
    $scope.mem.day.average = Math.round($scope.mem.day.average / 1048576)
    $scope.mem.day.percentile = Math.round($scope.mem.day.percentile / 1048576)
    $scope.mem.day.max = Math.round($scope.mem.day.max / 1048576)
  });
}

// pollUtilization calculates the utilization of a metric, 
// given a usage link and a limit link.
// The resulting utilization is placed under  $scope.data[idx]
// The last values of the limit is placed under $scope[lastLimit]
function pollUtilization(usageLink, limitLink, $scope, idx, lastLimitKey, $http, post_process){
  if (!$scope.run) return;
  var usage = [];
  var limit = [];
  var usage_stamp = $scope.stamp;
  var limit_stamp = $scope.stamp;

  // Get Metric Usage and store in the time-descending usage array .
  $http.get(usageLink + $scope.stamp)
      .success(function(data) {
        if ((data.metrics == undefined) || (data.metrics.length == 0)) {
          // No metrics are available, postpone
          return;
        }
        for(var i in data.metrics){
          usage.unshift({x: Date.parse(data.metrics[i].timestamp), 
            y: data.metrics[i].value});
        }
        usage_stamp = data.latestTimestamp;

        // Get Metric Limit and store in the time-descending limit array .
        $http.get(limitLink + $scope.stamp)
            .success(function(data) {
              if ((data.metrics == undefined) || (data.metrics.length == 0)) {
                // No metrics are available, postpone
                return;
              }
              for(var i in data.metrics){
                limit.unshift({x: Date.parse(data.metrics[i].timestamp), 
                  y: data.metrics[i].value});
              }

              // Update the last limit value
              var lastLimit = limit[0];
              if (!!lastLimit) {
                $scope[lastLimitKey] = post_process(lastLimit.y);
              }
              
              limit_stamp = data.latestTimestamp;
              // Use the usage and limit arrays to calculate utilization percentage.
              // Store in the appropriate time-ascending $scope.data array
              for (var i=0; i < limit.length; i++) {
                if ((!!usage[i]) && (!!limit[i])) {
                  $scope.data[idx]["values"].push({x: usage[i].x, y: (usage[i].y / limit[i].y)});
                }
              }

              var usage_time = Date.parse(usage_stamp);
              var limit_time = Date.parse(limit_stamp);
              // Need to normalize time by time zone offsets
              if (usage_time > limit_time) {
                $scope.stamp = (new Date(usage_time)).toISOString();
                console.log("usage stamp is greater than limit stamp");
              } else {
                $scope.stamp = (new Date(limit_time)).toISOString();
              }
            })
      });
};

// pollListing polls a listing API endpoint.
function pollListing(listLink, $scope, $http, callback){
  if (!$scope.run2) return;
  $http.get(listLink).success(function(data) {
    if (data.length == 0) {
      return;
    }
    for (var i=0; i < data.length; i++) {
      data[i].memUsage = Math.round(data[i].memUsage / 1048576);
    }
    $scope.items = data;
    callback();
  });
}

// listingController uses $scope.listLink to provide an ng-table sortable listing page
angular.module('kubedash').controller('ListingController', 
    function($scope, $http, $interval, $filter, NgTableParams) {
      $scope.items = [];
      $scope.sortItems = function(order) {
          $scope.items = $filter('orderBy')($scope.items, order);
      };

      $scope.tableParams = new NgTableParams({
        page: 1,
        count: 200,
        sorting: {
          memUsage: 'desc'
        }
      }, {
        total: $scope.items.length,
        getData: function($defer, params) {
          $scope.sortItems(params.orderBy());
          // TODO(afein): if using pagination, switched to $defer per page
          //$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

      $scope.pollList = function() {
        pollListing($scope.listLink, $scope, $http, function() {
          $scope.sortItems($scope.tableParams.orderBy());
        });
      };

      $scope.run2 = true;

      // Poll for new items every 30 seconds
      $scope.pollPromiseList = $interval($scope.pollList, 30000);

      // Trigger the first poll as soon as content is loaded
      // Force initial sorting by descending memory usage
      $scope.$watch('$viewContentLoaded', function() {
        $scope.pollList();
      });

      $scope.$on('$destroy', function () {
        $interval.cancel($scope.pollPromiseList);
      });

    });
