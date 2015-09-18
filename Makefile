all: build
TAG = v0.0.2
PREFIX = gcr.io/google-containers

deps:
	go get github.com/tools/godep

build: clean deps sanitize
	GOOS=linux GOARCH=amd64 GCO_ENABLED=0 godep go build -a .

clean: 
	rm -f kubedash

container: build
		docker build -t $(PREFIX)/kubedash:$(TAG) .

sanitize:
	hooks/check_boilerplate.sh
	hooks/check_gofmt.sh
	hooks/run_vet.sh

.PHONY: all deps build clean container sanitize
