# kubedash
Performance analytics UI for [Kubernetes](http://github.com/GoogleCloudPlatform/kubernetes) Clusters.

The goal of Kubedash it to allow the user or an administrator of a Kubernetes cluster to easily verify and understand the performance of a cluster and jobs running within it through intuitive visualizations of aggregated metrics, derived stats and event patterns.
It is not intended to be a general-purpose Kubernetes UI.
Instead, kubedash uses multiple sources of information to summarize and provide high-level analytic information to users and the cluster administrator.

Some of the current features are:
- Resource utilization views of Cluster, Nodes, Namespaces, Pods and Containers for the past 1 hour.
- Derived stats for each resource over the past 1 day.
- Indications of containers with no resource limits.

Future features include the following:
- Recommendations of resource limits for individual containers.
- Detecting and highlighting resource starvation in a cluster.
- Detecting and highlighting crash-looping and misbehaving containers.
- Support for other cluster management systems like CoreOS, Swarm, etc.

## Usage

To use Kubedash, the following are required:
- A Kubernetes cluster of v1.0 or higher is operational and accessible from kubectl.
- Heapster v0.18.0 is running as the `monitoring-heapster` service on the `default` namespace.

After cloning this repository, use the following command to create the Kubedash pod:

`kubectl.sh create -f deploy/kube-config/`

To access the Kubedash UI, visit the following URL: `https://<kubernetes-master>/api/v1/proxy/namespaces/default/services/kubedash/`
where `<kubernetes-master>` is the IP address of the kubernetes master node.

## Implementation

Kubedash is based on three components-

[Heapster](http://github.com/kubernetes/heapster) provides the data for Kubedash.
Heapster runs as a service by default in all kubernetes clusters, collecting metrics and analytics for individual containers.
The [Heapster Model](https://github.com/kubernetes/heapster/blob/master/docs/model.md) exposes aggregated metrics and statistics that are relevant for cluster-level analytics through a RESTful API. 

Kubedash provides the other two pieces - a web server relaying REST calls, managing sockets and providing additional authentication and, a frontend to provide visualizations for the aggregated metrics and statistics of interest.
