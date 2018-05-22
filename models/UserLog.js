const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const UserLogTableSchema = new Schema({
	_investor: { type: Schema.Types.ObjectId, ref: 'investors' },
	ip: { type: String },
	response: { type: Number },
	path: { type: String, required: true },
	date: { type: Date, default: Date.now() }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('userLog', UserLogTableSchema);
