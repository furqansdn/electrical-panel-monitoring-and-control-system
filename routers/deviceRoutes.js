const express = require('express');

const deviceController = require('../controllers/deviceController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.isLoggedIn, deviceController.getDevices)
  .post(deviceController.createDevice);

router
  .route('/:id')
  .get(deviceController.getOneDevice)
  .patch(deviceController.updateDevice)
  .delete(deviceController.deleteDevice);

router.patch('/:id/update-sub-device', deviceController.operateSubDevice);
router.patch('/:id/update-time', deviceController.updateStartEnd);
module.exports = router;
