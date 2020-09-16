const Electricity = require('../models/electricityModel');
const catchAsync = require('../utils/catchAsync');
const Device = require('../models/deviceModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getLogin = (req, res) => {
  if (req.user) return res.redirect('/');
  return res.status(200).render('login', {
    title: 'Login',
  });
};

// const statistic = (data) => {
//   return data.reduce((a, b) => {
//     const obj = {};
//     obj.totalPowerUsage = a.powerUsage + b.powerUsage;
//     obj.averageElectricCurrent =
//       (a.electricCurrent + b.electricCurrent) / data.length;
//     obj.averageVoltage = (a.voltage + b.voltage) / data.length;
//     return obj;
//   });
// };

exports.getDashboard = catchAsync(async (req, res, next) => {
  const electricity = await Electricity.aggregate([
    {
      $group: {
        _id: '$device',
        createdAt: { $last: '$createdAt' },
        voltage: { $last: '$voltage' },
        electricCurrent: { $last: '$electricCurrent' },
        power: { $last: '$power' },
        powerUsage: { $last: '$powerUsage' },
      },
    },
    {
      $lookup: {
        from: 'devices',
        localField: '_id',
        foreignField: '_id',
        as: 'device',
      },
    },
    {
      $sort: { device: 1 },
    },
  ]);

  const devices = await Device.find();
  return res.status(200).render('dashboard', {
    title: 'IOT DASHBOARD',
    electricity,
    devices,
  });
});

exports.getDevice = catchAsync(async (req, res, next) => {
  const device = await Device.findById(req.params.id);
  const elecQuery = new APIFeatures(
    Electricity.find({ device: req.params.id }),
    req.query
  )
    .sort()
    .paginate();

  const electricity = await elecQuery.query;
  res.status(200).render('device', {
    status: 'success',
    device,
    electricity,
  });
});

exports.getDeviceFormEdit = catchAsync(async (req, res, next) => {
  const device = await Device.findById(req.params.id);

  res.status(200).render('form/formEditDevice', {
    status: 'success',
    device,
  });
});

exports.getDeviceFormAdd = (req, res) => {
  res.status(200).render('form/formAddDevice', {
    status: 'success',
  });
};
