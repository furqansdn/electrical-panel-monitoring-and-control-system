export const modalShow = (DOM, url, title) => {
  //   const me = $(this),
  //     url = me.attr('href'),
  //     title = me.attr('title');

  console.log(url);
  DOM.modalTitle.text(title);
  DOM.modalBtnSave.show();

  $.ajax({
    url: url,
    dataType: 'html',
    success: function (response) {
      DOM.modalBody.html(response);
    },
  });

  DOM.modalLarge.modal('show');
};
