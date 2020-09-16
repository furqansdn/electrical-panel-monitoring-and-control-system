const mongoose = require('mongoose');

// const formatTime = require('../utils/formatTime');

const electricitySchema = new mongoose.Schema({
  voltage: {
    type: Number,
    required: [true, 'Electricity must have voltage'],
  },
  electricCurrent: {
    type: Number,
    required: [true, 'Electricity must have electric number'],
  },
  power: {
    type: Number,
    required: [true, 'Electricity must have power'],
  },
  powerUsage: {
    type: Number,
    required: [true, 'Electricity must have power usage'],
  },
  createdAt: {
    type: Date,
  },
  device: {
    type: mongoose.Schema.ObjectId,
    ref: 'Device',
    required: [true, 'Electricity must have device'],
  },
});
electricitySchema.pre('save', function (next) {
  this.createdAt = Date.now(); //- 1000 * 60 * 60 * 24 * 28;
  next();
});

// FIX GET LAST RECORD
// electricitySchema.post('aggregate', function (docs, next) {
//   docs.forEach((element) => {
//     element.createdAt = element.createdAt.toLocaleString();
//   });
//   next();
// });

// electricitySchema.post('save', function (docs, next) {
//   docs.createdAts = moment(docs.createdAt).fromNow();
//   console.log(docs.createdAts);
//   next();
// });

const Electricity = mongoose.model('Electricity', electricitySchema);
module.exports = Electricity;
