FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p /app/data && chown -R node:node /app
USER node
ENV PORT=7860
EXPOSE 7860
CMD ["node", "server.js"]
