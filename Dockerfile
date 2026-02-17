# Node.js base image
ARG NODE_TAG=22-bullseye-slim
FROM node:${NODE_TAG}

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    bash \
    curl \
    wget \
    ca-certificates \
    openssh-client \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Set up workspace directory
WORKDIR /workspace

# Ensure dev dependencies are available
ENV NODE_ENV=development

# Copy project files and install dependencies
COPY . .
RUN npm ci --no-fund && npm cache clean --force

# Copy migrations script and make it executable
COPY scripts/run-migrations.sh /usr/local/bin/run-migrations.sh

ENTRYPOINT ["/usr/local/bin/run-migrations.sh"]
CMD ["npm", "run", "dev"]
