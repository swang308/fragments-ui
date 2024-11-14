# ------------------------------------------------------------------- #
# STAGE 0 - Install dependencies
FROM node:18-bullseye-slim AS dependencies

LABEL maintainer="Shan-Yun Wang <swang308@myseneca.ca>"
LABEL description="Fragments Node.js microservice"

ENV API_URL=http://localhost:8080
ENV AWS_COGNITO_POOL_ID=us-east-1_w2hBqz0Mv
ENV AWS_COGNITO_CLIENT_ID=73bnq1q30k79bv6ok5akhefls8
ENV AWS_COGNITO_HOSTED_UI_DOMAIN=swang308-fragments.auth.us-east-1.amazoncognito.com
ENV OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
ENV OAUTH_SIGN_OUT_REDIRECT_URL=http://localhost:1234
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
ENV NODE_ENV=production

# Set up working directory
WORKDIR /build

# Copy package.json and package-lock.json
COPY package*.json .

# Install all dependencies, including devDependencies for Parcel build
RUN npm install

# ------------------------------------------------------------------- #
# STAGE 1 - Building the site using Parcel
FROM node:20.11.1-alpine AS build

WORKDIR /build

# Copy dependencies from the previous stage
COPY --from=dependencies /build /build

# Ensure that all dependencies, including polyfills, are installed
RUN npm install buffer process punycode querystring-es3

# Copy the source code to the working dir
COPY . .

# Create a .parcelrc file to force Parcel to include polyfills
RUN echo '{ "extends": "@parcel/config-default" }' > .parcelrc

# Build the site using parcel
RUN npx parcel build ./src/index.html --public-url ./ --dist-dir dist

# ------------------------------------------------------------------- #
# STAGE 2 - Hosting the site using Nginx
FROM nginx:1.23.0-alpine AS deploy

# Clear existing files in the Nginx HTML directory
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from the previous stage
COPY --from=build /build/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Add a health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
 CMD curl --fail localhost:80 || exit 1
