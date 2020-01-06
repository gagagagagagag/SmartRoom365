const disabledLightSwitches = [false, false, false, false];

const changeTheLightStatusOfAllLights = async status => {
	for (let status of disabledLightSwitches) {
		if (status) return;
	}

	let i = 0;
	for (let status of disabledLightSwitches) {
		status = true;
		$(`#lightControll${i}Spinner`).removeClass("d-none");
	}
	
	try {
		await $.ajax({
			type: "POST",
			url: "/resources/change-the-light-status-all",
			contentType: "application/json",
			data: JSON.stringify({
				status
			})
		});

		getLightInfo();
	} catch (e) {
		console.log(e);
	}
}

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
            url: "https://api.openweathermap.org/data/2.5/weather?id=756135&appid=5d7aec671e6cbcb8a2c9182058075e47"
        });

        console.log(response);
        displayWeatherInfo(response);
    } catch (e) {
        console.log(e);
    }
};

const displayWeatherInfo = weatherInfo => {
    $("#weatherWidgetImage").attr("src", `https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`);
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
    // console.log(lightInfo);
		//
	for (let i = 0; i < disabledLightSwitches.length; i++) { 
		disabledLightSwitches[i] = false;
	}

    for (let i = 0; i < lightInfo.length; i++) {
        if (lightInfo[i] === "1") {
            $(`#lightControll${i}`).addClass("icon-success");
			$(`#lightControll${i}`).removeClass("icon-danger");
        } else if (lightInfo[i] === "0") {
            $(`#lightControll${i}`).removeClass("icon-success");
			$(`#lightControll${i}`).removeClass("icon-danger");
        } else if (lightInfo[i] === "-") {
			$(`#lightControll${i}`).addClass("icon-danger");
			$(`#lightControll${i}`).removeClass("icon-success");
			disabledLightSwitches[i] = true;
		}
    }

    $(".light-status-spinners").addClass("d-none");

    for (let i = 0; i < lightInfo.length; i++) {
        $(`#lightControll${i}`).removeClass("d-none");
    }
};

const registerSW = async () => {
	if ("serviceWorker" in navigator) {
		try {
			await navigator.serviceWorker.register("./sw.js");
		} catch (e) {
			console.log("SW registration failed.");
		}
	}
};

socketInfo.on("lights", () => {
	getLightInfo();
});

window.addEventListener("load", () => {
	getLightInfo();
	getWeatherInfo();
	registerSW();
});
