const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const WithdrawalsSchema = new Schema({
	_investor: { type: Schema.Types.ObjectId, ref: 'investors' },
	_ico: { type: Schema.Types.ObjectId, ref: 'icos' },
	status: {
		type: String,
		enum: ['Initiated', 'Confirmed', 'Sent', 'Cancelled', 'Unconfirmed'],
		required: true,
		index: true
	},
	imported: { type: Boolean },
	confirmed_at: { type: Date },
	sent_at: { type: Date },
	cancelled_at: { type: Date },
	cancellationCode: { type: Number },
	amount: { type: Number, required: true },
	address: { type: String, required: true },
	txId: { type: String, unique: true, required: true }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('withdrawals', WithdrawalsSchema);
