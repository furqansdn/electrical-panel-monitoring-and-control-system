const myChart = (dom, data) => {
  return new Chart(dom, {
    type: 'line',
    data,
    options: {
      scales: {
        xAxes: [],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
};

export const renderChart = (dom, object, dataLabel) => {
  const labels = [];
  const data = [];

  object.forEach((element) => {
    labels.push(element.date);
    data.push(element.count);
  });

  const dataChart = {
    labels,
    datasets: [
      {
        label: dataLabel,
        data,
        borderWith: 2,
        fill: true,
      },
    ],
  };

  myChart(dom, dataChart).update();
};
