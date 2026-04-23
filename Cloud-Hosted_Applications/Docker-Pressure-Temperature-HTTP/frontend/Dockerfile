# Use the lightweight Nginx Alpine image
FROM nginx:alpine

# Copy your frontend files into the Nginx html directory
COPY . /usr/share/nginx/html

# Copy a custom Nginx config to handle API proxying (see step 2)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80