# Use an official Debian Bullseye (11) image
FROM debian:bullseye

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies, PostgreSQL server, and client tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    libcurl4-openssl-dev \
    libjansson-dev \
    libreadline-dev \
    make \
    nano \
    postgresql \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy local files into the container
COPY ./src /app/src
COPY ./CITATION.cff /app/CITATION.cff
COPY ./LICENSE /app/LICENSE
COPY ./LICENSE-cutest.txt /app/LICENSE-cutest.txt
COPY ./LICENSE-inih.txt /app/LICENSE-inih.txt
COPY ./README.md /app/README.md

# Build the project
WORKDIR /app/src
RUN make

# Install the project
RUN make install PREFIX=/usr/local

# Add the provided configuration file to /root/.aicliconfig
COPY aicli-config.ini /root/.aicliconfig

# Set up the entrypoint script to handle API key configuration and PostgreSQL setup
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Default to interactive bash shell, start with the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
CMD ["/bin/bash"]
