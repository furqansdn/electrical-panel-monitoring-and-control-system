const path = require('path');
const express = require('express');
const morgan = require('morgan');
const mqtt = require('mqtt');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

dotenv.config({
  path: './config.env',
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global Middlewares
app.use(express.static(`${__dirname}/public`));

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));

  app.use((req, res, next) => {
    req.requestTime = new Date();
    console.log(req.requestTime.toLocaleString());
    next();
  });
}

// Static Files

// Socket io
io.on('connection', () => {
  console.log('Made socket connection');
});

// initialization mqtt client connection
const client = mqtt.connect(process.env.MQTT_HOST, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});
client.on('connect', () => {
  console.log('Mqtt client connected');
});

module.exports = {
  app,
  client,
  io,
  http,
};
