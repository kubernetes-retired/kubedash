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
	"net/url"
	"path"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang/glog"
)

// heapster_url is an http://IP:Port route where Heapster is available.
// heapster_url is a package global to provide visibility to all handlers.
var heapster_url *url.URL

// base_url is the prefix for URL paths in this service.
var base_url string

// rootPath returns URL location prefixed with root.
func urlPath(location string) string {
	return path.Join(base_url, location)
}

// setupHandlers creates a gin Engine with configured routes, static files and templates.
func setupHandlers() *gin.Engine {
	r := gin.Default()
	r.Static(urlPath("/static"), "./static")
	r.Static(urlPath("/pages"), "./pages")

	// Load the base template
	r.LoadHTMLGlob("pages/index.html")

	// Configure routes
	r.GET(base_url, indexHandler)
	r.GET(urlPath("/api/*uri"), apiHandler)
	return r
}

// indexHandler renders the base index html template.
func indexHandler(c *gin.Context) {
	vars := gin.H{"base": base_url}
	c.HTML(200, "index.html", vars)
}

// metricURL translates request's URI into a heapster URL.
func metricUrl(uri string) (string, error) {
	query_path := strings.TrimPrefix(uri, base_url)
	query_url, err := url.Parse(query_path)
	if err != nil {
		return "", err
	}
	heapster_url.Path = query_url.Path
	heapster_url.RawQuery = query_url.RawQuery
	heapster_url.Fragment = query_url.Fragment
	return heapster_url.String(), nil
}

// apiHandler proxies all requests on /api/* to the Heapster API, using the same request URI.
func apiHandler(c *gin.Context) {
	uri := c.Request.RequestURI
	metric_url, err := metricUrl(uri)
	if err != nil {
		glog.Errorf("Malformed URI: %s - %v", uri, err)
		return
	}
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
