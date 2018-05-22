const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const CapTableSchema = new Schema({
	_investor: { type: Schema.Types.ObjectId, ref: 'investors' },
	_ico: { type: Schema.Types.ObjectId, ref: 'icos' },
	type: {
		type: String,
		enum: ['distribution', 'withdraw'],
		required: true,
		index: true
	},
	amount: { type: Number, required: true }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('captable', CapTableSchema);
