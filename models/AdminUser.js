const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const adminUserSchema = new Schema({
	googleId: {
		type: String
	},
	email: String,
	token: String
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('adminuser', adminUserSchema);
