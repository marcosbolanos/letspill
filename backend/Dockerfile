FROM node:24.12.0-trixie AS base

# Enable corepack for pnpm
RUN corepack enable

# Set default user
ARG USER=node

# Use default non-root user
USER $USER
WORKDIR /home/$USER/app

# Copy manifest files
COPY --chown=1000:1000 pnpm-lock.yaml package.json ./

# Install dependencies with caching
RUN --mount=type=cache,target=/home/$USER/.local/share/pnpm/store \
  pnpm install --frozen-lockfile



FROM base AS dev

# Set default user
ARG USER=node

# Optional dev tools
USER root

RUN corepack enable

COPY --chown=1000:1000 .optional .optional
RUN if [ -f .optional/dev-setup.sh ]; then \
  bash .optional/dev-setup.sh --user $USER; \
  fi

USER $USER
WORKDIR /home/$USER/app



FROM node:24.12.0-trixie AS prod

RUN corepack enable

# Set default user
ARG USER=node

USER $USER
WORKDIR /home/$USER/app

# Copy app source
COPY --chown=1000:1000 . .

# Copy deps from base
COPY --from=base /home/$USER/app/node_modules/ ./node_modules

CMD ["pnpm", "start"]
