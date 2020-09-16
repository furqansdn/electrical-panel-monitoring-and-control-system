const express = require('express');
const electricityController = require('../controllers/electricityController');

const router = express.Router();

router.route('/last-record').get(electricityController.getLastRecord);

router.route('/statistic').get(electricityController.getElectricityStatistics);

router.route('/:id/daily').get(electricityController.getElectricityDaily);
module.exports = router;
