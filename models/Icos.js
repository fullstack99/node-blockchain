const mongoose = require('mongoose');
const moment = require('moment');
const { Schema } = mongoose;

const IcoSchema = new Schema({
	name: {
		type: String,
		required: true,
		index: { unique: true }
	},
	description: String,
	symbol: {
		type: String,
		uppercase: true,
		required: true,
		index: { unique: true }
	},
	status: {
		type: String,
		enum: ['active', 'closed', 'canceled', 'pending', 'new'],
		default: 'new'
	},
	tokencurrency: {
		type: String,
		enum: ['USD', 'BTC', 'ETH'],
		default: 'USD'
	},
	usdRule: {
		allowed: { type: Boolean, default: true },
		minPurchase: Number
	},
	btcRule: {
		allowed: { type: Boolean, default: true },
		minPurchase: Number
	},
	ethRule: {
		allowed: { type: Boolean, default: true },
		minPurchase: Number
	},
	periods: [
		{
			name: String,
			dateStart: { type: Date, default: Date.now },
			dateEnd: { type: Date, default: +new Date() + 30 * 24 * 60 * 60 * 1000 },
			tokenPrice: Number,
			minTokens: { type: Number, default: 1 },
			tokensCap: Number
		}
	],
	documents: [
		{
			name: {
				type: String,
				enum: ['Offering memorandum', 'Whitepaper', 'Subscription Agreement']
			},
			url: String
		}
	],
	logo: String,
	target: Number,
	website: String,
	raised: Number,
	investmentsAllowed: { type: Boolean, default: true },
	investorRules: {
		aml: { type: Boolean, default: true },
		kyc: { type: Boolean, default: true },
		accreditation: { type: Boolean, default: true }
	},
	restrictedCountries: Array,
	lprId: { type: String },
	eth_cold_address: String,
	visible: { type: Boolean, default: true },
	close_date: { type: Date },
	btc_cold_address: String,
	eth_hot_balance_min: { type: Number, default: 1 },
	btc_hot_balance_min: { type: Number, default: 1 },
	eth_hot_balance_max: { type: Number, default: 3 },
	btc_hot_balance_max: { type: Number, default: 3 },
	ncAccountName: { type: String, required: true },
	close_date: { type: Date }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

mongoose.model('icos', IcoSchema);
