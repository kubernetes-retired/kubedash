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

package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/GoogleCloudPlatform/kubernetes/pkg/client"
	"github.com/golang/glog"
)

var (
	argPort              = flag.Int("port", 8289, "Port to listen to")
	argIp                = flag.String("listen_ip", "", "IP to listen on, defaults to all IPs")
	argHeadless          = flag.Bool("headless", false, "Headless mode should be enabled if the dashboard is running outside of a Kubernetes cluster")
	argHeapsterURL       = flag.String("heapster_url", "", "URL of the Heapster API. Used only during headless mode")
	argHeapsterService   = flag.String("heapster_service", "monitoring-heapster", "Name of the Heapster service")
	argHeapsterNamespace = flag.String("heapster_namespace", "default", "Namespace where Heapster is operating")
)

// getKubeHeapsterURL uses the Kubernetes API client to retrieve Heapster's Portal IP and Port.
// getKubeHeapsterURL handles all errors as fatal errors, allowing the kubedash pod to restart
// until Heapster is successfully reachable.
func getKubeHeapsterURL() string {
	cl, err := client.NewInCluster()
	if err != nil {
		glog.Fatalf("unable to create Kubernetes API client: %s", err)
	}

	services := cl.Services(*argHeapsterNamespace)
	heapster_service, err := services.Get(*argHeapsterService)
	if err != nil {
		glog.Fatalf("unable to locate Heapster service: %s", *argHeapsterService)
	}

	heap_ip := heapster_service.Spec.ClusterIP
	if strings.Count(heap_ip, ".") != 3 {
		glog.Fatalf("invalid cluster IP address for the Heapster Service: %s", heap_ip)
	}
	if len(heapster_service.Spec.Ports) == 0 {
		glog.Fatalf("no heapster Ports registered")
	}

	heap_port := heapster_service.Spec.Ports[0].Port
	if heap_port == 0 {
		glog.Fatalf("heapster port is 0")
	}

	heapster_root := fmt.Sprintf("http://%s:%d", heap_ip, heap_port)
	resp, err := http.Get(heapster_root)
	if err != nil {
		glog.Fatalf("unable to GET %s", heapster_root)
	}
	if resp.StatusCode != 200 {
		glog.Fatalf("GET %s responded with status code: %d", heapster_root, resp.StatusCode)
	}

	return heapster_root
}

// main is the driver function of Kubedash.
// main inserts initial log entries, sets up handlers and runs a gin Engine.
func main() {
	defer glog.Flush()
	flag.Parse()
	glog.Infof(strings.Join(os.Args, " "))
	glog.Infof("Kubedash version 0.0.1")
	glog.Infof("Starting kubedash on port %d", *argPort)

	if !*argHeadless {
		heapster_url = getKubeHeapsterURL()
	} else {
		heapster_url = *argHeapsterURL
	}

	r := setupHandlers(heapster_url)

	addr := fmt.Sprintf("%s:%d", *argIp, *argPort)
	r.Run(addr)
	os.Exit(0)
}
