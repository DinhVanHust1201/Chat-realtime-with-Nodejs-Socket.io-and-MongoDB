const moment = require('moment');

const formatMessage = (data) => {
    msg = {
        from:data.fromUser,
        to:data.toUser,
        message:data.msg,
        date: moment().format("YYYY-MM-DD"),
        time: moment().format("hh:mm a")
    }
    return msg;
}
module.exports=formatMessage;

/*const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
    msg: {
        type: String,
        required: true
    }
})

const Msg = mongoose.model('msg', msgSchema);
module.exports = Msg;*/