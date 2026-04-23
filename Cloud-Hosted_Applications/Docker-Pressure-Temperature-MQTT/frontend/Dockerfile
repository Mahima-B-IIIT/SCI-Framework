FROM nginx:alpine

# Copy the custom config from the root (we'll handle the path in compose)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static website files
COPY . /usr/share/nginx/html

EXPOSE 80