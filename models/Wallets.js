const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const WalletsSchema = new Schema({
	_investor: {
		type: Schema.Types.ObjectId,
		ref: 'investors',
		index: true
	},
	_ico: {
		type: Schema.Types.ObjectId,
		ref: 'icos',
		index: true
	},
	btcAddress: { type: String },
	ethAddress: { type: String },
	lprId: { type: String }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

WalletsSchema.index({ _investor: 1, _ico: 1 }, { unique: true });

mongoose.model('wallets', WalletsSchema);
