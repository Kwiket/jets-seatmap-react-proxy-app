FROM --platform=linux/amd64 nginx:1.20.1
LABEL name="jets-seatmap-react-proxy-app"

COPY ./nginx.conf /etc/nginx/conf.d/nginx.conf
COPY ./gzip.conf /etc/nginx/default.d/gzip.conf
COPY ./build /usr/share/nginx/html/react-proxy-app

RUN chmod -R 777 /usr/share/nginx/html/react-proxy-app

EXPOSE 80