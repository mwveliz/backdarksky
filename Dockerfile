FROM node:carbon

RUN wget http://download.redis.io/redis-stable.tar.gz && \
    tar xvzf redis-stable.tar.gz && \
    cd redis-stable && \
    make && \
    mv src/redis-server /usr/bin/ && \
    cd .. && \
    rm -r redis-stable && \
    npm install -g concurrently   

EXPOSE 6379

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

EXPOSE 5000

EXPOSE 6379

COPY start.sh /start.sh

RUN ["chmod", "+x", "/start.sh"]

ENTRYPOINT "./start.sh"
