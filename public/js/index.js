/* eslint-disable */
import '@babel/polyfill';
// import axios from 'axios';
import moment from 'moment';

import { renderChart } from './dataChart';
import { getData, socket } from './socket';
import * as api from './api';
import { modalShow } from './modal';

// DOM SELECTOR
const btnSwitch = document.querySelectorAll('.btn-switch');
const chartElectricity = document.querySelector('.chart-electricity');
const btnDeleteDevice = document.querySelectorAll('.btn-delete--device');
const formLogin = document.querySelector('#form-login');
const logoutBtn = document.querySelector('.logout');
const btnUpdateTime = document.querySelector('.btn-update-time');

const getDashboardDOM = (id) => {
  const DOM = {
    voltage: document.querySelector(`.key-voltage[data-id="${id}"]`),
    electricCurrent: document.querySelector(
      `.key-electricCurrent[data-id="${id}"]`
    ),
    power: document.querySelector(`.key-power[data-id="${id}"]`),
    powerUsage: document.querySelector(`.key-powerUsage[data-id="${id}"]`),
    lastUpdated: document.querySelector(`.key-lastUpdated[data-id="${id}"]`),
  };
  return DOM;
};
const modalDOM = {
  modalLarge: $('#modal'),
  modalBody: $('#modal-body'),
  modalTitle: $('.modal-title'),
  modalBtnSave: $('#btn-modal-save'),
};

/** HELPER **/
const toogleClass = (el, classOne, classTwo) => {
  const classArr = el.className.split(' ');
  const indexOfClassOne = classArr.indexOf(classOne);
  if (indexOfClassOne >= 0) {
    classArr.splice(indexOfClassOne, 1);
    classArr.push(classTwo);
  } else {
    classArr.splice(classArr.indexOf(classTwo), 1);
    classArr.push(classOne);
  }
  el.className = classArr.join(' ');
};

const getBoolean = (value) => {
  switch (value) {
    case true:
    case 'true':
    case 1:
    case '1':
    case 'on':
    case 'yes':
      return true;
    default:
      return false;
  }
};

function groupBy(object, duration) {
  const formated = object.map((el) => {
    return {
      // createdAt: moment(el.createdAt).startOf(duration).format('YYYY-MM-DD'),
      createdAt: moment(el.createdAt).startOf(duration).format('YYYY-MM-DD'),
      powerUsage: el.powerUsage,
    };
  });
  const dates = formated.map((el) => el.createdAt);
  const uniqueDates = dates.filter(
    (date, index) => dates.indexOf(date) === index
  );
  return uniqueDates.map((date) => {
    const count = formated
      .filter((el) => el.createdAt === date)
      .reduce((count, elem) => count + elem.powerUsage, 0);

    return { date, count };
  });
}
/** END HELPER **/

// Event Handler

// Login HANDLER
if (formLogin) {
  document.querySelector('#btn-signin').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    api.executeLogin(
      email,
      password,
      document.querySelector('#login-container')
    );
  });
}

// logout handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', api.executeLogout);
}

// Onload Dashboard
getData(getDashboardDOM);

// Onclick btn switch that operate sub device
if (btnSwitch) {
  let id;
  if (document.querySelector('.device-info'))
    id = document.querySelector('.device-info').dataset.id;
  btnSwitch.forEach((element) => {
    element.addEventListener('click', async (e) => {
      e.preventDefault();
      element.innerHTML = 'PROCES....';
      const operate = getBoolean(element.dataset.operate);
      const obj = {};

      Object.assign(obj, { [element.dataset.item]: operate });

      await api.operateSubDevice(id, obj);
      element.setAttribute('data-operate', !operate);
      setTimeout(() => {
        toogleClass(element, 'btn-success', 'btn-danger');
        element.innerHTML = operate ? 'MATIKAN' : 'HIDUPKAN';
      }, 1000);
    });
  });
}

// LINE CHART
let chartArrData = [];
if (chartElectricity) {
  const deviceID = chartElectricity.dataset.id;
  window.addEventListener('load', async () => {
    const data = await api.getDailyPowerUsage(deviceID);
    chartArrData = data.electricity;

    const dataWeekly = groupBy(chartArrData, 'week');

    renderChart(chartElectricity, dataWeekly, 'Total Daya Perminggu dalam Kwh');
  });

  socket.on(`/electricity/${deviceID}`, (data) => {
    const obj = {
      powerUsage: data.powerUsage,
      createdAt: data.createdAt,
    };
    chartArrData.pop();
    chartArrData.push(obj);
    const dataWeekly = groupBy(chartArrData, 'week');

    renderChart(chartElectricity, dataWeekly, 'Total Daya Perminggu dalam Kwh');
  });
}

// Modal Event
document.querySelectorAll('.btn-modal-show').forEach((element) => {
  element.addEventListener('click', (e) => {
    e.preventDefault();
    const url = element.getAttribute('href');
    const title = element.dataset.title;

    modalShow(modalDOM, url, title);
  });
});

if (modalDOM.modalBtnSave) {
  modalDOM.modalBtnSave.on('click', (event) => {
    event.preventDefault();
    let form;
    if ($('#modal-form')) form = $('#modal-form');
    api.ajaxHandler(form, modalDOM.modalLarge);
  });
}

// DELETE Event
if (btnDeleteDevice) {
  btnDeleteDevice.forEach((element) => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const url = element.getAttribute('href');

      api.deleteDevice(url);
    });
  });
}
// Date Picker inisialisasi
$('.input-group.date')
  .datetimepicker({
    icons: {
      time: 'fa fa-clock',
      date: 'fa fa-calendar-day',
      up: 'fa fa-chevron-up',
      down: 'fa fa-chevron-down',
      previous: 'fa fa-chevron-left',
      next: 'fa fa-chevron-right',
      today: 'fa fa-screenshot',
      clear: 'fa fa-trash',
      close: 'fa fa-remove',
    },
    format: 'HH:mm',
  })
  .on('dp.change', function (event) {
    if (btnUpdateTime) btnUpdateTime.classList.remove('d-none');
    console.log(btnUpdateTime);
  });

if (btnUpdateTime) {
  btnUpdateTime.addEventListener('click', async (e) => {
    e.preventDefault();
    const id = document.querySelector('.device-info').dataset.id;
    const start = document.getElementById('date-start').value;
    const end = document.getElementById('date-end').value;

    const status = await api.setDeviceTime(id, start, end);
    if (status === 'success') btnUpdateTime.classList.add('d-none');
  });
}
