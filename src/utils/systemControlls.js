const { audio } = require("system-control");
const path = require("path");
const player = require('play-sound')(opts = {});
const Alarm = require("../models/alarm");
const Gpio = require("onoff").Gpio;

let light;

let activeAlarm;
let audioPlaying = false;
let audioProcess;

const setupThePin = () => {
    try {
        if (!light) {
            light = new Gpio(process.env.GPIO_LIGHT_PIN, "out");
        }

        light.setActiveLow(true);
    } catch (e) {
        console.log(e);
    }
};

const changeTheLightStatus = on => {
    try {
        if (!light) {
            light = new Gpio(process.env.GPIO_LIGHT_PIN, "out");
        }

        light.writeSync(on);
    } catch(e) {
        console.log(e);
    }
};

const getTheLightStatus = () => {
    try {
        if (!light) {
            light = new Gpio(process.env.GPIO_LIGHT_PIN, "out");
        }

        return !light.readSync();
    } catch (e) {
        console.log(e);
    }
};

const ringTheAlarm = async alarm => {
    try {
        activeAlarm = alarm;

        await turnVolumeUp(100);
        if (playMusic() === -1) {
            console.log("Music already playing.");
        }

        // Send info through sockets that an alarm is playing.

    } catch (e) {
        console.log(e);
    }
};

const stopTheAlarm = () => {

    const musicResponse = stopMusic();

    changeTheLightStatus(true);

    activeAlarm = undefined;

    return musicResponse;

};

const turnVolumeUp = async volumeLevel => {
    try {
        audio.volume(volumeLevel);
        return;
    } catch (e) {
        console.log(e);
    }
};

const playMusic = () => {
    if (audioPlaying) {
        return -1;
    }

    audioPlaying = true;

    audioProcess = player.play(path.join(__dirname, "RammsteinDuhast.mp3"), {}, err => {
        if (err) {
            console.log(err);
            throw err
        }
        audioPlaying = false;
    });

    return 0;
};

const stopMusic = () => {
    if (!audioPlaying) {
        return -1;
    }

    audioProcess.kill();
    audioPlaying = false;

    return 0;
};

const isMusicPlaying = () => {
    return audioPlaying;
};

const getActiveAlarm = () => {
    return activeAlarm;
};

const checkIfAnyAlarmsTriggered = () => {

    setInterval(async () => {
        const activeAlarms = await Alarm.getActiveAlarms();

        if (activeAlarms.length === 0) {
            return;
        }

        for (let alarm of activeAlarms) {
            if (alarm.checkIfTriggered()) {
                ringTheAlarm(alarm);
            }
        }

    }, 1000 * 60);
};

// Turn on the time checking at a full minute
let setCheckingAlarmsAtFullMinutes = setInterval(() => {
    const dateNow = new Date();

    if (dateNow.getSeconds() === 0) {
        clearInterval(setCheckingAlarmsAtFullMinutes);
        checkIfAnyAlarmsTriggered();
    }
}, 500);

checkIfAnyAlarmsTriggered();
setupThePin();

module.exports = {
    turnVolumeUp,
    playMusic,
    stopMusic,
    isMusicPlaying,
    getActiveAlarm,
    stopTheAlarm,
    getTheLightStatus,
    changeTheLightStatus
};