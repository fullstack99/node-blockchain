const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const xRateSchema = new Schema({
	rate: {
		type: Number
	},
	currency: {
		type: String,
		enum: ['BTC', 'ETH']
	},
	date: {
		type: Date,
		default: Date.now
	}
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('xRate', xRateSchema);
