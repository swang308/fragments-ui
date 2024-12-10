# ------------------------------------------------------------------- #
# STAGE 0 - Install dependencies
FROM node:20.11.1-alpine AS dependencies

LABEL maintainer="Shan-Yun Wang <swang308@myseneca.ca>"
LABEL description="Fragments Node.js microservice"

# ARGs for fragments API and AWS Cognito configurations
ARG API_URL=http://localhost:8080
ARG AWS_COGNITO_POOL_ID=us-east-1_w2hBqz0Mv
ARG AWS_COGNITO_CLIENT_ID=73bnq1q30k79bv6ok5akhefls8
ARG AWS_COGNITO_HOSTED_UI_DOMAIN=swang308-fragments.auth.us-east-1.amazoncognito.com
ARG OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
ARG OAUTH_SIGN_OUT_REDIRECT_URL=http://localhost:1234

# Environment configurations
ENV API_URL=${API_URL}
ENV AWS_COGNITO_POOL_ID=${AWS_COGNITO_POOL_ID}
ENV AWS_COGNITO_CLIENT_ID=${AWS_COGNITO_CLIENT_ID}
ENV AWS_COGNITO_HOSTED_UI_DOMAIN=${AWS_COGNITO_HOSTED_UI_DOMAIN}
ENV OAUTH_SIGN_IN_REDIRECT_URL=${OAUTH_SIGN_IN_REDIRECT_URL}
ENV OAUTH_SIGN_OUT_REDIRECT_URL=${OAUTH_SIGN_OUT_REDIRECT_URL}
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
ENV NODE_ENV=production

# Set up working directory
WORKDIR /build

# Copy package.json and package-lock.json
COPY package*.json .

# Install production dependencies
RUN npm ci --only=production

# ------------------------------------------------------------------- #
# STAGE 1 - Building the site using Parcel
FROM node:20.11.1-alpine AS build

WORKDIR /build

# Copy dependencies from the previous stage
COPY --from=dependencies /build /build

# Copy the source code to the working dir
COPY . .

# Build the site using Parcel
RUN npx parcel build ./src/index.html --public-url ./

# ------------------------------------------------------------------- #
# STAGE 2 - Hosting the site using Nginx
FROM nginx:1.23.0-alpine AS deploy

# Copy the build output from the previous stage
COPY --from=build /build/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Add a health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
 CMD curl --fail localhost:80 || exit 1
