FROM node:23-alpine AS build_image

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

RUN npm install --save @babel/runtime

RUN touch .env

RUN echo "VITE_API_URL='MY_APP_VITE_API_URL'" >> .env

RUN npm run build

FROM node:23-alpine AS production_image

WORKDIR /app
COPY --from=build_image /app/build /app/build

RUN npm install -g serve

RUN apk add --no-cache bash
RUN touch env.sh
RUN echo "#!/bin/sh" > env.sh
RUN echo "for i in \$(env | grep MY_APP_)" >> env.sh
RUN echo "do" >> env.sh
RUN echo "    key=\$(echo \$i | cut -d '=' -f 1)" >> env.sh
RUN echo "    value=\$(echo \$i | cut -d '=' -f 2-)" >> env.sh
RUN echo "    echo \$key=\$value" >> env.sh
RUN echo "    find /app/build -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i \"s|\${key}|\${value}|g\" '{}' +" >> env.sh
RUN echo "done" >> env.sh
RUN echo "exec serve -s /app/build -l 3000" >> env.sh

RUN chmod +x env.sh

EXPOSE 3000
ENTRYPOINT [ "./env.sh" ]