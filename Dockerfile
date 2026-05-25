ARG NODE_IMAGE=node:22-alpine
FROM ${NODE_IMAGE}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY cli.mjs README.md LICENSE ./
COPY skills ./skills
COPY assets ./assets

ENTRYPOINT ["node", "/app/cli.mjs"]
CMD ["help"]
