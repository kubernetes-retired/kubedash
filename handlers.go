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
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang/glog"
)

// heapster_url is an http://IP:Port route where Heapster is available.
// heapster_url is a package global to provide visibility to all handlers.
var heapster_url string

// setupHandlers creates a gin Engine with configured routes, static files and templates.
func setupHandlers(url string) *gin.Engine {
	heapster_url = url
	r := gin.Default()
	r.Static("/static", "./static")
	r.Static("/pages", "./pages")

	// Load the base template
	r.LoadHTMLGlob("pages/index.html")

	// Configure routes
	r.GET("/", indexHandler)
	r.GET("/api/*uri", apiHandler)
	return r
}

// indexHandler renders the base index html template.
func indexHandler(c *gin.Context) {
	vars := gin.H{}
	c.HTML(200, "index.html", vars)
}

// apiHandler proxies all requests on /api/* to the Heapster API, using the same request URI.
func apiHandler(c *gin.Context) {
	uri := c.Request.RequestURI
	metric_url := heapster_url + uri
	resp, err := http.Get(metric_url)
	if err != nil {
		glog.Errorf("unable to GET %s - %v", metric_url, err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		glog.Errorf("GET %s responded with status code: %d", metric_url, resp.StatusCode)
		return
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		glog.Errorf("unable to read response body from %s", metric_url)
		return
	}

	_, err = c.Writer.Write(body)
	if err != nil {
		glog.Errorf("unable to write body to response for %s", uri)
	}
}
