# kubedash
Performance analytics dashboard for [Kubernetes](http://github.com/GoogleCloudPlatform/kubernetes)

The goal of Kubedash it to allow the user or an administrator of a Kubernetes cluster to easily verify and understand the performance of a cluster and jobs running within it through intuitive visualizations of aggregated metrics, derived stats and event patterns. It is not intended to be a general-purpose Kubernetes UI. Instead, kubedash uses multiple sources of information to summarize and provide high-level analytic information to users and admin.

Some of the use-cases are:
- Cluster and node utilization by resources
- Utilization by pods and namespaces
- Advice on resource limits for pods based on historical usage.
- Detecting and highlighting resource starvation in a cluster.
- Detecting and highlighting crash-looping and misbehaving containers.

## Implementation

Kubedash is based on three components: a cluster-level metric aggregator, a web server and a browser frontend. 
[Heapster](http://github.com/GoogleCloudPlatform/heapster) is used as the metric aggregator. Heapster runs as part of a service in all default kubernetes clusters.Heapster is being extended to calculate aggregated metrics and statistics relevant for analytics, which would be exposed through a REST API to the web server. Kubedash provides the other two pieces - a web server relaying REST calls, managing sockets and providing additional authentication and a frontend to provide visualizations for the aggregated metrics and statistics of interest.

Testing cla bot
