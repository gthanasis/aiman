FROM node:20-alpine

WORKDIR /app

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