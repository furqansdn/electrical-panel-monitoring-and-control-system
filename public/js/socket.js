/* eslint-disable */
import io from 'socket.io-client';

export const socket = io();

export const getData = (fnDOM) => {
  socket.on('electricity', (data) => {
    const DOM = fnDOM(data.device);
    if (DOM.voltage) DOM.voltage.innerHTML = `${data.voltage} V`;
    if (DOM.electricCurrent)
      DOM.electricCurrent.innerHTML = `${data.electricCurrent} A`;
    if (DOM.power) DOM.power.innerHTML = `${data.power} W`;
    if (DOM.powerUsage) DOM.powerUsage.innerHTML = `${data.powerUsage} kWh`;
    if (DOM.lastUpdated)
      DOM.lastUpdated.innerHTML = `Last Updated ${new Date(
        data.createdAt
      ).toLocaleString()}`;
  });
};
