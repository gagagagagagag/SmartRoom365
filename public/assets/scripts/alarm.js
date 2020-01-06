// Templates
const alarmListTemplateHTML = $("#alarmList-template").html();
const alarmListTemplate = Handlebars.compile(alarmListTemplateHTML);

let alarmList;

const rotateArrowListView = index => {
    const element = $(`#arrowListView${index}`);

    if (  $( element ).css( "transform" ) === 'none' ){
        $(element).css("transform","rotate(180deg)");
    } else {
        $(element).css("transform","" );
    }
};

$("#alarmSetForm").submit(async e => {

    e.preventDefault();

    // Disable button and show spinner
    $("#buttonCreateNewAlarm").prop("disabled", true);
    $("#createNewAlarmButtonSpinner").removeClass("d-none");

    const dateNow = new Date();
    const datePicked = new Date();

    const hourPicked = parseInt($(e.target.elements["alarmSetTime"]).val().split(':')[0]);
    const minutePicked = parseInt($(e.target.elements["alarmSetTime"]).val().split(':')[1]);

    datePicked.setHours(hourPicked);
    datePicked.setMinutes(minutePicked);

    if (hourPicked < dateNow.getHours()) {
        datePicked.setDate(datePicked.getDate() + 1);
    } else {
        if (minutePicked <= dateNow.getMinutes()) {
            datePicked.setDate(datePicked.getDate() + 1);
        }
    }

    try {
        await $.ajax({
            type: "POST",
            url: "/resources/set-a-new-alarm",
            contentType: "application/json",
            data: JSON.stringify({
                name: $(e.target.elements["alarmSetName"]).val(),
                description: $(e.target.elements["alarmSetDescription"]).val(),
                repeatAlarm: $(e.target.elements["alarmSetRepeat"]).val(),
                active: true,
                date: datePicked
            })
        });

        await getAlarmList();

    } catch (e) {
        console.log(e);

        showErrorMessage("Error!", "There was an error while creating the alarm, try again.");
    }

    $("#buttonCreateNewAlarm").prop("disabled", false);
    $("#createNewAlarmButtonSpinner").addClass("d-none");

    showSuccessMessage("Success!", "The alarm has been created!");

});

const getAlarmList = async () => {
    try {
        alarmList = await $.ajax({
            type: "GET",
            url: "/resources/get-all-alarms"
        });

        showAlarmList();
    } catch (e) {
        console.log(e);
    }
};

const showAlarmList = () => {
    const $alarmsListDiv = $("#alarmsListDiv");

    $alarmsListDiv.empty();

    if (alarmList.length === 0) {
        $alarmsListDiv.append("<div class=\"d-flex justify-content-center mt-5 mb-5\">No alarms set.</div>");
        return;
    }

    let i = 0;
    for (let alarm of alarmList) {
        let alarmDate = new Date(alarm.date);
        $alarmsListDiv.append(alarmListTemplate({
            alarmListIndex: i,
            alarmListName: alarm.name,
            alarmListHour: `${alarmDate.getHours() <= 9 ? "0" : ""}${alarmDate.getHours()}:${alarmDate.getMinutes() <= 9 ? "0" : ""}${alarmDate.getMinutes()}`,
            alarmListRepeatClass: alarm.repeatAlarm === "No" ? "d-none" : "",
            alarmListRepeatText: alarm.repeatAlarm === "No" ? "" : `Repeats ${alarm.repeatAlarm}`,
            alarmListID: alarm._id
        }));

        $(`#alarmListToggle${i}`).prop("checked", alarm.active);

        $(`#alarmListToggle${i}`).on("click", alarmChangeActiveState);

        i++;
    }
};

const alarmChangeActiveState = async e => {
    let parentsList = $(e.target).parents();

    let $alarmParentElement = $(parentsList[3]);
    let $statusSpinner = $(parentsList[1]).children("div");

    $(e.target).prop("disabled", true);
    $statusSpinner.removeClass("d-none");


    try {
        await $.ajax({
            type: "POST",
            url: "/resources/change-alarm-active-status",
            contentType: "application/json",
            data: JSON.stringify({
                id: $alarmParentElement.attr("id")
            })
        });

    } catch (e) {
        console.log(e);
        getAlarmList();
    }

    $(e.target).prop("disabled", false);
    $statusSpinner.addClass("d-none");
};

const getRingingAlarm = async () => {

    let ringingAlarm;

    try {
        ringingAlarm = await $.ajax({
            type: "GET",
            url: "/resources/get-ringing-alarm"
        });
    } catch(e) {
        console.log(e);
        return;
    }

    if (ringingAlarm) {
        showAlarmModal(ringingAlarm);
    }
};

const showAlarmModal = alarm => {

    $("#alarmModalTitleSpan").text(alarm.name);

    $("#alarmModalBellIcon").addClass("animated tada infinite");

    const alarmDate = new Date(alarm.date);

    $("#alarmModalHour").text(`${alarmDate.getHours() <= 9 ? "0" : ""}${alarmDate.getHours()}:${alarmDate.getMinutes() <= 9 ? "0" : ""}${alarmDate.getMinutes()}`);

    $("#alarmModalDescription").text(alarm.description);

    $("#alarmModalDismissButton").on("click", hideAlarmModal);

    $("#showAlarmModal").click();
};

const hideAlarmModal = async () => {
    $("#alarmModalDismissButton").prop("disabled", true);
    $("#alarmModalDismissSpinner").removeClass("d-none");

    try {
        await $.ajax({
            type: "POST",
            url: "/resources/stop-ringing-alarm"
        });

    } catch (e) {
        console.log(e);
    }

    $("#alarmModalTitleSpan").text("Loading...");

    $("#alarmModalBellIcon").removeClass("animated tada infinite");

    $("#alarmModalHour").text("00:00");

    $("#alarmModalDismissButton").on("click", () => { console.log("No alarm to dismiss."); });

    $("#alarmModalDismissButton").prop("disabled", false);
    $("#alarmModalDismissSpinner").addClass("d-none");

    $("#alarmModalButtonDismiss").click();
};

socketInfo.on("alarm", () => {
	getRingingAlarm();
});

getAlarmList();
getRingingAlarm();
