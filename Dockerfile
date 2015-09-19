FROM progrium/busybox
MAINTAINER almavrog@google.com

# Copy all pages to /pages
ADD pages /pages

# Create the static JS and css directories
ADD static /static
RUN mkdir -p /static/js

# Add the application frontend under /static
ADD app /static/js/app

# Add third party JS files under /static
ADD third_party/jquery/dist/jquery.min.js /static/js/
ADD third_party/bootstrap/dist/js/bootstrap.min.js /static/js/
ADD third_party/angular/angular.min.js /static/js/
ADD third_party/angular-route/angular-route.min.js /static/js/
ADD third_party/d3/d3.min.js /static/js/
ADD third_party/nvd3/build/nv.d3.min.js /static/js/
ADD third_party/angular-nvd3/dist/angular-nvd3.min.js /static/js/
ADD third_party/ng-table/dist/ng-table.min.js /static/js/

# Add third party CSS files under /static
ADD third_party/bootstrap/dist/css/bootstrap.min.css /static/css/
ADD third_party/custom_bootstrap/main.css /static/css/
ADD third_party/nvd3/build/nv.d3.css /static/css/
ADD third_party/ng-table/dist/ng-table.min.css /static/css/

# Copy the Kubedash binary
ADD kubedash /kubedash

ENTRYPOINT ["/kubedash"]
