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

# Configure the existing node user for development
RUN usermod -aG sudo node \
    && echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
    && usermod --shell /bin/bash node

# Set up workspace directory
WORKDIR /workspace

# Ensure dev dependencies are available
ENV NODE_ENV=development

# Copy project files and install dependencies
COPY . .
RUN npm ci --no-fund && npm cache clean --force

# Ensure the non-root `node` user owns the workspace so it can write build/artifact dirs
RUN chown -R node:node /workspace

# Copy migrations script and make it executable
COPY scripts/run-migrations.sh /usr/local/bin/run-migrations.sh
RUN chown node:node /usr/local/bin/run-migrations.sh && chmod +x /usr/local/bin/run-migrations.sh

# Switch to non-root user
USER node

ENTRYPOINT ["/usr/local/bin/run-migrations.sh"]
CMD ["npm", "run", "dev"]
