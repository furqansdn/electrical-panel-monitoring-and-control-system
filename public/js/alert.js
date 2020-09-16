export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (DOM, type, msg) => {
  hideAlert();
  const markup = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <span class="alert-icon"><i class="ni ni-like-2"></i></span>
        <span class="alert-text">${msg}</span>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>    
    `;
  DOM.insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 3000);
};
