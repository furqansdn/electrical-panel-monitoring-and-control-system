const excel = require('exceljs');

const Device = require('../models/deviceModel');
const Electricity = require('../models/electricityModel');
const catchAsync = require('../utils/catchAsync');
const Communication = require('../utils/communication');

const parseNewObj = (obj) => {
  const newObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = `subDevice.${key}`;
    Object.assign(newObj, { [newKey]: value });
  });
  return newObj;
};

const sendString = (obj) => {
  const arr = [];
  Object.entries(obj).forEach(([key, value]) => {
    const data = `${key.split('.')[1]}:${value === true ? 1 : 0}`;
    arr.push(data);
  });
  return arr.join(',');
};

const sendStringTime = (obj) => {
  const arr = [];
  Object.entries(obj).forEach(([key, value]) => {
    const data = `${key}:${value}`;
    arr.push(data);
  });
  return arr.join(',');
};
exports.getDevices = catchAsync(async (req, res, next) => {
  const devices = await Device.find();

  res.status(200).json({
    status: 'success',
    devices,
  });
});

exports.createDevice = catchAsync(async (req, res, next) => {
  const device = await Device.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      device,
    },
  });
});

exports.getOneDevice = catchAsync(async (req, res, next) => {
  const device = await Device.findById(req.params.id).populate({
    path: 'electricities',
  });

  res.status(200).json({
    status: 'success',
    data: {
      device,
    },
  });
});

exports.updateDevice = catchAsync(async (req, res, next) => {
  if (req.body._method) delete req.body._method;

  const device = await Device.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: 'success',
    device,
  });
});

exports.deleteDevice = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  await Electricity.deleteMany({ device: id });
  await Device.findByIdAndDelete(id);
  res.status(204).json({
    status: 'success',
  });
});

exports.operateSubDevice = catchAsync(async (req, res, next) => {
  const parseObj = parseNewObj(req.body);

  const device = await Device.findByIdAndUpdate(
    req.params.id,
    { $set: parseObj },
    {
      new: true,
    }
  );
  new Communication(device.subscribeTopic, sendString(parseObj)).publish();
  res.status(200).json({
    status: 'success',
    device,
  });
});

exports.updateStartEnd = catchAsync(async (req, res, next) => {
  const { start, end } = req.body;
  const device = await Device.findByIdAndUpdate(
    req.params.id,
    { $set: { start, end } },
    { new: true }
  );
  new Communication(device.subscribeTopic, sendStringTime(req.body)).publish();
  res.status(200).json({
    status: 'success',
    device,
  });
});

exports.excelDownload = catchAsync(async (req, res, next) => {
  const recap = [];
  const device = await Device.findById(req.params.id).populate({
    path: 'electricities',
  });

  device.electricities.forEach((obj) => {
    recap.push({
      tegangan: obj.voltage,
      arus: obj.electricCurrent,
      daya: obj.power,
      daya_terpakai: obj.powerUsage,
      tanggal: obj.createdAt,
    });
  });

  const worbook = new excel.Workbook();
  const worksheet = worbook.addWorksheet(`Recap Data ${device.name}`);

  worksheet.columns = [
    { header: 'Tegangan', key: 'tegangan', width: 5 },
    { header: 'Arus', key: 'arus', width: 5 },
    { header: 'Daya', key: 'daya', width: 5 },
    { header: 'Daya Tepakai', key: 'daya_terpakai', width: 5 },
    { header: 'Tanggal', key: 'tanggal', width: 10 },
  ];

  recap.forEach((el) => {
    worksheet.addRow(el);
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Rekap Data${device.name}.xlsx`
  );

  await worbook.xlsx.write(res);
  return res.status(200).end();
});
