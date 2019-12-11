const jwt = require("jsonwebtoken");

const initialiseThemeCookie = () => {
    const payload = {
        fixedHeader: "fixed-header",
        fixedSidebar: "fixed-sidebar",
        fixedFooter: "",
        headerColorClass: "bg-night-sky header-text-light",
        sidebarColorClass: "bg-happy-green sidebar-text-light"
    };

    return jwt.sign(payload, process.env.JWT_SECRET);
};

module.exports = initialiseThemeCookie;