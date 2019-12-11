const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    repeatAlarm: {
        type: String
    },
    active: {
        type: Boolean
    },
    date: {
        type: Date
    }

}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

alarmSchema.statics.getActiveAlarms = function() {
    return this.find({active: true});
};

alarmSchema.methods.setNextRepeat = async function() {
    const alarm = this;

    console.log(alarm.repeatAlarm);

    if (alarm.repeatAlarm === "No") {
        this.active = false;
    } else if (alarm.repeatAlarm === "Daily") {
        this.date.setDate(this.date.getDate() + 1);
    } else if (alarm.repeatAlarm === "Weekly") {
        this.date.setDate(this.date.getDate() + 7);
    }

    await alarm.save();
};

alarmSchema.methods.checkIfTriggered = function() {
    const alarm = this;

    const timeNow = new Date();
    if (timeNow.getFullYear() === this.date.getFullYear() && timeNow.getMonth() === this.date.getMonth() && timeNow.getDay() === this.date.getDay() && timeNow.getHours() === this.date.getHours() && timeNow.getMinutes() === this.date.getMinutes()) {
        alarm.setNextRepeat();
        return true;
    }

    return false;
};

const Alarm = mongoose.model("Alarm", alarmSchema);

module.exports = Alarm;