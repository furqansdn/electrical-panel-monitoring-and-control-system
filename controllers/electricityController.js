// const Electricity = require('../models/electricityModel');
const mongoose = require('mongoose');

const Device = require('../models/deviceModel');
const { io } = require('../app');
const Electricity = require('../models/electricityModel');
const catchAsync = require('../utils/catchAsync');

exports.createElectricity = async (topic, message) => {
  try {
    // const obj = {};
    const mes = JSON.parse(message.toString());
    if (mes.location) {
      const device = await Device.findOne({ locationSlug: mes.location });
      if (device.status !== mes.status) {
        device.status = mes.status;
        await device.save();
      }
      mes.device = device.id;
    }

    const electricity = await Electricity.create(mes);

    io.emit('electricity', electricity);
    io.emit(`/electricity/${electricity.device}`, electricity);
  } catch (error) {
    console.log(error);
  }
};

exports.getLastRecord = catchAsync(async (req, res, next) => {
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
    // {
    //   $limit: 1,
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      electricity,
    },
  });
});

exports.getElectricityStatistics = catchAsync(async (req, res, next) => {
  const statistics = await Electricity.aggregate([
    {
      $match: {
        device: ['5f46a1b27bd5f038f40d4076', '5f4b4456a343ac01d08d6998'],
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      statistics,
    },
  });
});

exports.getElectricityWeekly = catchAsync(async (req, res, next) => {
  const electricity = await Electricity.aggregate([
    {
      $match: { device: req.params.id },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      electricity,
    },
  });
});

exports.getElectricityDaily = catchAsync(async (req, res, next) => {
  const date = req.query.date || 30;
  const electricity = await Electricity.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(Date.now()),
          $gte: new Date(Date.now() - 3600 * 1000 * 24 * date),
        },
        device: mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: '$createdAt' },
        powerUsage: { $last: '$powerUsage' },
        createdAt: { $last: '$createdAt' },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    total: electricity.length,
    electricity,
  });
});
