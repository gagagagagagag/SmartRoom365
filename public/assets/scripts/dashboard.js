const disabledLightSwitches = [false, false, false, false];

const changeTheLightStatus = async lightID => {

    if (disabledLightSwitches[lightID]) {
        return;
    }

    disabledLightSwitches[lightID] = true;
    $(`#lightControll${lightID}Spinner`).removeClass("d-none");

    try {
        await $.ajax({
            type: "POST",
            url: "/resources/change-the-light-status",
            contentType: "application/json",
            data: JSON.stringify({
                lightID
            })
        });

        getLightInfo();
    } catch (e) {
        console.log(e);
    }
};

const getWeatherInfo = async () => {
    try {
        const response = await $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/weather?id=756135&appid=5d7aec671e6cbcb8a2c9182058075e47"
        });

        console.log(response);
        displayWeatherInfo(response);
    } catch (e) {
        console.log(e);
    }
};

const displayWeatherInfo = weatherInfo => {
    $("#weatherWidgetImage").attr("src", `http://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`);
    $("#weatherWidgetImageSpinner").remove();
    $("#weatherWidgetImage").removeClass("d-none");

    $("#weatherWidgetTemperature").text(Math.floor(parseInt(weatherInfo.main.temp) - 273) + "°C");
    $("#weatherWidgetTemperatureSpinner").remove();
    $("#weatherWidgetTemperature").removeClass("d-none");
};

const getLightInfo = async () => {
    try {
        const lightInfo = await $.ajax({
            type: "GET",
            url: "/resources/get-the-light-status"
        });

        showLightInfo(lightInfo);
    } catch (e) {
        console.log(e);
    }
};

const showLightInfo = lightInfo => {
    console.log("Update light info");

    for (let i = 0; i < lightInfo.length; i++) {
        if (lightInfo[i] === "1") {
            $(`#lightControll${i}`).addClass("icon-success");
        } else {
            $(`#lightControll${i}`).removeClass("icon-success");
        }
    }

    $(".light-status-spinners").addClass("d-none");

    for (let i = 0; i < lightInfo.length; i++) {
        $(`#lightControll${i}`).removeClass("d-none");
    }

    for (let i = 0; i < disabledLightSwitches.length; i++) {
        disabledLightSwitches[i] = false;
    }
};

getLightInfo();
getWeatherInfo();