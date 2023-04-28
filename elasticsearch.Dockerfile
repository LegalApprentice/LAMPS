FROM docker.elastic.co/elasticsearch/elasticsearch:7.17.1

ENV discovery.type=single-node
ENV xpack.security.enabled=false

EXPOSE 9200
EXPOSE 9300

# az acr login --name iobtassets
# sudo docker build -t elasticsearch -f elasticsearch.Dockerfile .
# sudo docker run -it --rm -p 9200:9200 --name elasticsearch elasticsearch
# docker tag elasticsearch iobtassets.azurecr.io/elasticsearch:v1.1.0
# docker push iobtassets.azurecr.io/elasticsearch:v1.1.0
# docker exec -it elasticsearch bash


#  docker run -d -p 9200:9200 --name elasticsearch elasticsearch
#  use this for persistent storage
#  docker run -d -p 9200:9200 -p 9300:9300 -v data:/usr/share/elasticsearch/data --name elasticsearch elasticsearch

# or other options for the cloud
# docker run -d -p 9200:9200/tcp -p 9300:9300/tcp elasticsearch:latest -v data:/usr/share/elasticsearch/data
# docker run --rm -d -p 9200:9200/tcp -p 9300:9300/tcp -v /iobt/esdata:/usr/share/elasticsearch/data elasticsearch:latest