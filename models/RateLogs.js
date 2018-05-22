const mongoose = require('mongoose');
const { Schema } = mongoose;

const RateLogsSchema = new Schema({
	source: {
		type: String
	},
	raw: {
		type: Object
	},
	currency: {
		type: String,
		enum: ['BTC', 'ETH']
	},
	date: {
		type: Date
	}
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('ratelogs', RateLogsSchema);
