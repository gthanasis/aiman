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

# Create test files and directory structure
RUN mkdir -p /tmp/test_dir/loop /tmp/test_dir/actual /tmp/test_archive source backup test_dir && \
    # cd_symlink_loop
    ln -sf /tmp/test_dir/loop /tmp/test_dir/loop/link && \
    # list_with_hidden_files_sorted
    touch .hidden_file regular_file && \
    touch -t 202001010000 older_file && \
    # resolve_physical_path
    ln -sf /tmp/test_dir/actual /tmp/test_dir/symlink && \
    # safe_copy_overwrite
    echo "original content" > file.txt && \
    echo "backup content" > backup.txt && \
    # move_all_with_progress
    bash -c 'for i in {1..10}; do dd if=/dev/zero of=source/file$i bs=1M count=10 status=none; done' && \
    # find_exclude_path
    mkdir -p node_modules src/utils && \
    touch test.py src/main.py node_modules/setup.py src/utils/helpers.py && \
    # grep_multiline_match
    echo -e "java.lang.Exception: Could not process request\n    at Service.process()\n    Caused by: NullPointerException" > error.log && \
    # tail_follow_json
    echo '{"status": "running", "timestamp": "2023-06-01T12:00:00Z"}' > json.log && \
    # preview_large_file_fast
    bash -c 'for i in {1..200}; do echo "Line $i of the big file" >> bigfile.txt; done' && \
    # cut_utf8_column
    echo -e "name·age·location\njohn·25·london\nanna·34·paris" > file.txt && \
    # sort_human_numerical
    dd if=/dev/zero of=file1 bs=1K count=10 status=none && \
    dd if=/dev/zero of=file2 bs=1M count=1 status=none && \
    dd if=/dev/zero of=file3 bs=10K count=10 status=none && \
    # check_large_files
    touch test_dir/small.txt && \
    truncate -s 50M large_file.bin && \
    # extract_tar_from_url
    mkdir -p /tmp/test_archive && \
    echo "test content" > /tmp/test_archive/test.txt && \
    tar -czf /tmp/archive.tar.gz -C /tmp test_archive && \
    # run_background_limit_cpu
    echo '#!/bin/bash\nwhile true; do echo "Running..."; sleep 1; done' > heavy-task.sh && \
    chmod +x heavy-task.sh

# Create a directory for test output
RUN mkdir -p output

VOLUME ["/app/output"]

# never fail for debug
CMD tail -f /dev/null