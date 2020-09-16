const mongoose = require('mongoose');
const slugify = require('slugify');

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Device must have name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Device must have location'],
    },
    locationSlug: {
      type: String,
    },
    subscribeTopic: {
      type: String,
      required: [true, 'Device must subscribe a particular topic'],
    },
    status: {
      type: String,
      enum: {
        values: ['idle', 'oprt', 'manual', 'extratime'],
      },
    },
    subDevice: {
      lamp: { type: Boolean, default: false },
      outlet: { type: Boolean, default: false },
      airCon: { type: Boolean, default: false },
    },
    start: {
      type: String,
      default: '06:00',
    },
    end: {
      type: String,
      default: '18:00',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

deviceSchema.virtual('electricities', {
  ref: 'Electricity',
  foreignField: 'device',
  localField: '_id',
  options: { sort: { createdAt: -1 } },
  match: {
    createdAt: {
      $lte: new Date(Date.now()),
      $gte: new Date(Date.now() - 3600 * 1000 * 24 * 30),
    },
  },
});

deviceSchema.pre('save', function (next) {
  this.locationSlug = slugify(this.location, { lower: true });
  next();
});

// deviceSchema.pre('findOneAndUpdate', function (next) {
//   console.log(this);
//   next();
// });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
