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

# Build
RUN yarn build

#DB Migrations
RUN npx prisma migrate deploy

# Serve the app
CMD ["yarn", "start:prod"]