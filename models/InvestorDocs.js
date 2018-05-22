const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const InvestorDocsSchema = new Schema({
	_investor: { type: Schema.Types.ObjectId, ref: 'investors' },
	title: { type: String },
	file: { type: String },
	country: { type: String },
	accreditation: { type: Boolean, default: false }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('investorDoc', InvestorDocsSchema);
