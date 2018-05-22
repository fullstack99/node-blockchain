const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const IcoSubTableSchema = new Schema({
	_investor: { type: Schema.Types.ObjectId, ref: 'investors', required: true },
	_ico: { type: Schema.Types.ObjectId, ref: 'icos', required: true },
	subscribed_at: { type: Date, default: Date.now }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('icoSub', IcoSubTableSchema);
