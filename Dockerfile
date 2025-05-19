FROM node:20-alpine

WORKDIR /app

# Install tools required for tests
RUN apk add --no-cache \
    curl \
    wget \
    jq \
    cpulimit \
    rsync \
    grep \
    findutils \
    coreutils \
    util-linux \
    procps \
    iproute2 \
    lsof \
    tar \
    bash

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Create a directory for test output
RUN mkdir -p output

VOLUME ["/app/output"]

# never fail for debug
CMD tail -f /dev/null