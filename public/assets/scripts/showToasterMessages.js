const showSuccessMessage = (title, body) => {
    toastr.options.closeButton = true;
    toastr.options.timeOut = 10000;
    toastr.options.extendedTimeOut = 20000;
    toastr.options.progressBar = true;
    toastr.success(body, title);
};

const showErrorMessage = (title, body) => {
    toastr.options.closeButton = true;
    toastr.options.timeOut = 10000;
    toastr.options.extendedTimeOut = 20000;
    toastr.options.progressBar = true;
    toastr.error(body, title);
};