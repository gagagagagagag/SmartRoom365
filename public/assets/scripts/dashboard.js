const changeTheLightStatus = async newStatus => {
    try {
        await $.ajax({
            type: "POST",
            url: "/resources/change-the-light-status",
            contentType: "application/json",
            data: JSON.stringify({
                newStatus
            })
        });
    } catch (e) {
        console.log(e);
    }
};