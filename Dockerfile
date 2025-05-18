FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Create a directory for test output
RUN mkdir -p output

# Fix the circular dependency issue with strip-ansi
RUN echo '{\n  "name": "strip-ansi",\n  "version": "7.1.0",\n  "type": "commonjs"\n}' > /app/node_modules/strip-ansi/package.json && \
    echo 'module.exports = function stripAnsi(string) { return String(string).replace(/\\u001B\\[\\d+m/g, ""); };' > /app/node_modules/strip-ansi/index.js

VOLUME ["/app/output"]

# never fail for debug
CMD tail -f /dev/null