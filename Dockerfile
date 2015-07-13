FROM progrium/busybox
MAINTAINER almavrog@google.com

ADD templates /templates
ADD static /static
ADD kubedash /kubedash
ENTRYPOINT ["/kubedash"]
