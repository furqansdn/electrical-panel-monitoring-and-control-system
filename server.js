const mongoose = require('mongoose');
// const socket = require('socket.io');

const Communication = require('./utils/communication');

// Database Connection
const password = encodeURIComponent(process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE.replace('<PASSWORD>', password);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Database Connected');
  })
  .catch((error) => {
    console.log(error);
  });

const { http, app } = require('./app');
const ErrorHandler = require('./utils/errorHandler');
const globalErrorHandler = require('./controllers/errorController');
const deviceRouter = require('./routers/deviceRoutes');
const viewRouter = require('./routers/viewRoutes');
const electricityRouter = require('./routers/electricityRoutes');
const userRouter = require('./routers/userRoutes');
const electricityController = require('./controllers/electricityController');

// Route
app.use('/', viewRouter);
app.use('/api/v1/device', deviceRouter);
app.use('/api/v1/electricity', electricityRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new ErrorHandler(`Halaman ${req.originalUrl} tidak ditemukan`, 404));
});

// Subscribe the incoming data from all devices
new Communication(process.env.SUBSCRIBE_TO_TOPIC)
  .subscribeIncoming()
  .listenIncoming(electricityController.createElectricity);

app.use(globalErrorHandler);

const port = process.env.PORT || 8080;
http.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
