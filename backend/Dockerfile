# Stage 1: Build the application
FROM node:23-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

# Stage 2: Create the production image
FROM node:23-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["npm", "start"]