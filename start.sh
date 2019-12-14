#!/bin/sh
sleep 5s
node /app/index.js
/usr/bin/redis-server --bind '0.0.0.0' &
