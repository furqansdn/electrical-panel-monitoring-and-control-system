import axios from 'axios';

import { showAlert } from './alert';

export const executeLogin = async (email, password, alertDOM) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status == 'success') {
      showAlert(alertDOM, res.data.status, 'Berhasil Login');
      window.setTimeout(() => {
        location.reload(true);
      }, 700);
    }
  } catch (error) {
    console.log(error);
    showAlert(alertDOM, 'danger', error.response.data.message);
  }
};

export const executeLogout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    showAlert('error', 'Error logging out! Try again');
  }
};

export const operateSubDevice = async (id, obj) => {
  try {
    const url = `/api/v1/device/${id}/update-sub-device`;
    const res = await axios({
      method: 'PATCH',
      url,
      data: obj,
    });

    if (res.data.status == 'success') {
      //   console.log('Berhasil');
    }
  } catch (err) {
    console.log(err.response);
  }
};

export const getDailyPowerUsage = async (id) => {
  try {
    const url = `/api/v1/electricity/${id}/daily`;
    const res = await axios({
      method: 'GET',
      url,
    });
    return res.data;
  } catch (error) {
    console.log(err);
  }
};

export const deleteDevice = async (url) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url,
    });

    showAlert(
      document.querySelector('.card-device--list'),
      'warning',
      'Berhasil Menghapus Data'
    );
    window.setTimeout(() => {
      location.reload(true);
    }, 1000);
  } catch (error) {
    console.log(error);
    showAlert(
      document.querySelector('.card-device--list'),
      'danger',
      'Gagal! Ada kesalahan pada sistem'
    );
  }
};

export const ajaxHandler = async (form, modal) => {
  try {
    // const formData = new FormData(form[0]);
    const url = form.attr('action');
    const method =
      $('input[name=_method]').val() == undefined ? 'POST' : 'PATCH';

    const res = await axios({
      method,
      url,
      data: form.serialize(),
    });

    if ((res.data.status = 'success')) {
      modal.modal('hide');

      showAlert(
        document.querySelector('.card-device--list'),
        res.data.status,
        'Berhasil Menambah/Modifikasi Data'
      );
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (error) {
    showAlert(
      document.querySelector('.card-device--list'),
      'error',
      'Gagal! Ada kesalahan pada sistem'
    );
  }
};

export const setDeviceTime = async (id, start, end) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/device/${id}/update-time`,
      data: {
        start,
        end,
      },
    });

    if (res.data.status === 'success') {
      return res.data.status;
    }
  } catch (error) {
    showAlert(
      document.querySelector('.container-fluid'),
      'error',
      'Gagal! Ada kesalahan pada sistem'
    );
  }
};
