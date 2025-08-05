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

# Copy files to the workspace
COPY . .

# Install dependencies
RUN npm install

# Change ownership of workspace to node user
RUN chown -R node:node /workspace

# Switch to non-root user
USER node

# Default command
CMD ["npm", "run", "dev"]
