const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const AdminLogTableSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'adminuser' },
	ip: { type: String },
	path: { type: String, required: true },
	method: { type: String },
    payload: {}
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('adminLog', AdminLogTableSchema);
