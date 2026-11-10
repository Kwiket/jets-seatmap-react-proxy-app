# The build output is static files, so build on the builder's native platform.
FROM --platform=$BUILDPLATFORM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# The env file (see .env-sample) is mounted for this step only and never stored in a layer.
# Its REACT_APP_* values are embedded in the built JS bundle.
RUN --mount=type=secret,id=env,target=/app/.env,required=true npm run build

FROM --platform=linux/amd64 nginx:1.30-alpine
LABEL name="jets-seatmap-react-proxy-app"

# Replaces the stock default.conf, which would otherwise answer requests for Host: localhost.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY gzip.conf /etc/nginx/default.d/gzip.conf
COPY --from=build /app/build /usr/share/nginx/html/react-proxy-app

EXPOSE 80
