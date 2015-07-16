FROM progrium/busybox
MAINTAINER almavrog@google.com

ADD templates /templates
ADD static /static

# add third party JS static files
ADD third_party/jquery/dist/jquery.min.js /static/js
ADD third_party/bootstrap/dist/bootstrap.min.js /static/js
ADD third_party/angular/angular.min.js /static/js
ADD third_party/angular-route/angular-route.min.js /static/js
ADD third_party/d3/d3.min.js /static/js
ADD third_party/nvd3/nvd3.min.js /static/js
ADD third_party/angular-nvd3/dist/angular-nvd3.min.js /static/js

# add third party CSS static files
ADD third_party/bootstrap/dist/bootstrap.min.css /static/css
ADD third_party/nvd3/nvd3.min.css /static/css

ADD kubedash /kubedash
ENTRYPOINT ["/kubedash"]
