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

# Don’t copy app code or install deps in the image for a bind-mounted devcontainer.

# Clean npm cache and rebuild all native dependencies for this architecture
RUN npm cache clean --force && \
    rm -rf node_modules/.cache && \
    npm rebuild --verbose

# Switch to non-root user
USER node

# Keep the container alive for VS Code to attach.
# Start the dev server via devcontainer.json postStartCommand instead.
CMD ["bash", "-lc", "sleep infinity"]
