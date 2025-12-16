FROM node:18 AS builder

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend
COPY frontend ./frontend
RUN chmod +x frontend/node_modules/.bin/react-scripts
RUN npm run build --prefix frontend

FROM node:18

WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm install --prefix backend
COPY backend ./backend
COPY --from=builder /app/frontend/build ./frontend/build

EXPOSE 3001

CMD ["npm", "start", "--prefix", "backend"]