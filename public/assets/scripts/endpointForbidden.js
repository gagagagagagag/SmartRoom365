// TODO Add to every script when the endpoint returns a 403 status aka Google OAuth needs to be refreshed

const endpointForbidden = loc => {
    window.location.replace(`/?loc=${loc}`);
};