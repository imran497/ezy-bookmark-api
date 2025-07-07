# Use the Node official image
# https://hub.docker.com/_/node
FROM node:24.1.0

# Create and change to the app directory.
WORKDIR /app

# Copy local code to the container image
COPY . ./

# Install packages
RUN yarn install --frozen-lockfile

# --- Accept build-time variables ---
ARG DATABASE_URL
ARG DIRECT_URL

# --- Export to ENV so Prisma can use it ---
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL

# Generate Prisma client and build
RUN echo "🔧 Generating Prisma client..." && \
    npx prisma generate && \
    echo "🏗️ Building application..." && \
    yarn build && \
    echo "✅ Build completed successfully" && \
    ls -la dist/src/


# Build
RUN yarn build

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]