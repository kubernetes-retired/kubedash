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
	"net/url"
	"os"
	"path"
	"strings"

	"github.com/golang/glog"
)

var (
	argPort            = flag.Int("port", 8289, "Port to listen to")
	argIp              = flag.String("listen_ip", "", "IP to listen on, defaults to all IPs")
	argHeadless        = flag.Bool("headless", false, "Headless mode should be enabled if the dashboard is running outside of a Kubernetes cluster")
	argHeapsterURL     = flag.String("heapster_url", "", "URL of the Heapster API. Used only during headless mode")
	argHeapsterService = flag.String("heapster_service", "heapster", "Name of the Heapster service")
	argBaseUrl         = flag.String("base_url", "/", "Base URL path for Kubedash")
)

// main is the driver function of Kubedash.
// main inserts initial log entries, sets up handlers and runs a gin Engine.
func main() {
	defer glog.Flush()
	flag.Parse()
	glog.Infof(strings.Join(os.Args, " "))
	glog.Infof("Kubedash version 0.0.1")
	glog.Infof("Starting kubedash on port %d", *argPort)

	var err error = nil
	if !*argHeadless {
		raw_url := fmt.Sprintf("http://%s", *argHeapsterService)
		heapster_url, err = url.ParseRequestURI(raw_url)
	} else {
		raw_url := *argHeapsterURL
		heapster_url, err = url.ParseRequestURI(raw_url)
	}

	if err != nil {
		glog.Fatalf("Error parsing heapster URL: %s", err)
		os.Exit(1)
	}

	base_url = *argBaseUrl
	if base_url != "/" {
		base_url = path.Join("/", base_url) + "/"
	}

	r := setupHandlers()

	addr := fmt.Sprintf("%s:%d", *argIp, *argPort)
	r.Run(addr)
	os.Exit(0)
}
