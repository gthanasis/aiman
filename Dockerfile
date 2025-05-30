FROM node:20-alpine

WORKDIR /app

# Install tools required for tests and man pages
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
    bash \
    man-pages \
    docs \
    mandoc \
    less

# Configure man pages
RUN echo "MANPATH_MAP /usr/bin /usr/share/man" >> /etc/manpath.config && \
    echo "MANPATH_MAP /usr/local/bin /usr/local/share/man" >> /etc/manpath.config

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Create a directory for test output
RUN mkdir -p output

VOLUME ["/app/output"]

# never fail for debug
CMD ["tail", "-f", "/dev/null"]