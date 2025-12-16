FROM node:18 AS builder

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend
COPY frontend ./frontend
RUN chmod +x frontend/node_modules/.bin/react-scripts
RUN npm run build --prefix frontend

FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential python3

COPY backend/package*.json ./backend/
RUN npm install --prefix backend
RUN cd backend && npm rebuild sqlite3
COPY backend ./backend
COPY --from=builder /app/frontend/build ./frontend/build

EXPOSE 3001

CMD ["npm", "start", "--prefix", "backend"]