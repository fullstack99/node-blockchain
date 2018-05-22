const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const TransactionSchema = new Schema({
	_investor: { type: Schema.Types.ObjectId, ref: 'investors' },
	_ico: { type: Schema.Types.ObjectId, ref: 'icos' },
	amount: { type: Number, required: true },
	xRate: { type: Number, required: true },
	currency: {
		type: String,
		required: true,
		index: true
	},
	type: {
		type: String,
		enum: ['buy', 'withdraw', 'refund', 'distribution'],
		required: true,
		index: true
	},
	txId: {
		type: String,
		required: true
	},
	status: {
		type: String,
		enum: ['pending', 'confirmed', 'cancelled', 'unconfirmed'],
		required: true,
		index: true,
		default: 'confirmed'
	},
	address: String
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

TransactionSchema.index({ _investor: 1, _ico: 1, txId: 1 }, { unique: true });

mongoose.model('transactions', TransactionSchema);
