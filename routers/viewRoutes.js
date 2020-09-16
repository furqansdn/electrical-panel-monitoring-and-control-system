const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const deviceController = require('../controllers/deviceController');

const router = express.Router();

router.get('/login', authController.isLoggedIn, viewController.getLogin);

router.get(
  '/',
  authController.isLoggedIn,
  authController.redirectIfNotLogin,
  viewController.getDashboard
);
router.get(
  '/device/create',
  authController.isLoggedIn,
  authController.redirectIfNotLogin,
  viewController.getDeviceFormAdd
);
router.get(
  '/device/:id',
  authController.isLoggedIn,
  authController.redirectIfNotLogin,
  viewController.getDevice
);
//   .patch(viewController.updateDevice);
router.get(
  '/device/:id/edit',
  authController.isLoggedIn,
  authController.redirectIfNotLogin,
  viewController.getDeviceFormEdit
);

router.get('/device/:id/recap-data', deviceController.excelDownload);

module.exports = router;
