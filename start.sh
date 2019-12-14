#!/bin/sh
/usr/bin/redis-server --bind '0.0.0.0' &
sleep 5s
node /app/index.js

