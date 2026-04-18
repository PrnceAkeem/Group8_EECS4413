FROM node:20-alpine

WORKDIR /app

COPY Backend/package*.json ./Backend/
RUN cd Backend && npm ci --omit=dev

COPY Backend/ ./Backend/
COPY Frontend/ ./Frontend/

WORKDIR /app/Backend

EXPOSE 8080

CMD ["node", "server.js"]
