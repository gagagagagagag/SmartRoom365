function onSuccess(googleUser) {

    if (signOutFlag === "userSignedOut"){
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut();

        signOutFlag = "";

        return;
    }

    // Get the token and store it in the cookie
    let id_token = googleUser.getAuthResponse().id_token;

    document.cookie = `authToken=${id_token}; expires=Thu, 18 Dec 2039 12:00:00 UTC`;

    console.log(userLocation);

    // Redirect to the main site
    window.location = userLocation ? userLocation : "/home";
}

function onFailure(error) {
    console.log(error);
}

function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email openid',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}