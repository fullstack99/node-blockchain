const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment');
const _ = require('lodash');

const ncCall = require('../services/ncCall');
const background = require('../services/background');
// const FormatDate = mongoose.Schema.Types.FormatDate = require('mongoose-schema-formatdate');
const { Schema } = mongoose;

const InvestorSchema = new Schema({
	email: {
		type: String,
		trim: true,
		lowercase: true,
		required: 'Email address is required',
		match: [
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
			'Please fill a valid email address'
		],

		index: { unique: true }
	},
	password: { type: String, select: false },
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	firstName: String,
	lastName: String,
	country: String,
	securityQuestions: [
		{
			question: String,
			answer: { type: String, select: false }
		}
	],
	mfa: {
		created: { type: Date, default: Date.now(), select: false },
		enrolled: { type: Boolean, default: false },
		secret: { type: String, select: false },
		otp: { type: String, select: false },
		signin: { type: Boolean, default: false },
		withdrawal: { type: Boolean, default: false }
	},
	dob: {
		type: Date
		// validate: {
		// 	validator: function (v) {
		// 		console.log(v)
		// 		return /\d{2}-\d{2}-\d{4}/.test(v);
		// 	},
		// 	message: '{VALUE} is not a valid date !'
		// },
	},
	phone: {
		type: String
		// validate: {
		// 	validator: Number.isInteger,
		// 	message: '{VALUE} is not an integer value'
		// }
	},
	address1: { type: String },
	address2: { type: String },
	state: { type: String },
	city: { type: String },
	zip: { type: String },
	taxId: { type: String },
	companyName: { type: String },
	entityType: {
		type: String,
		default: '',
		enum: [
			'',
			'corporation',
			'llc',
			'partnership',
			'individual',
			'nonprofit',
			'foreigncorp'
		]
	},
	investAs: {
		type: String,
		default: 'Individual',
		enum: ['Individual', 'Entity']
	},
	verification: {
		ncAml_status: { type: String, default: 'Not Verified' },
		ncAml: { type: Boolean, default: false },
		Aml_date: { type: Date },
		ncKyc: { type: Boolean, default: false },
		ncKyc_status: { type: String, default: 'Not Verified' },
		idmAml_status: {
			type: String,
			default: 'Not Verified',
			set: function(idmAml_status) {
				this._isModifiedIdmStatus = true;
				this._idmAml_status = this.verification.idmAml_status;
				return idmAml_status;
			}
		},
		idmAml: {
			type: Boolean,
			default: false,
			set: function(idmAml) {
				this._isModifiedIdmAml = true;
				this._idmAml = this.verification.idmAml;
				return idmAml;
			}
		},
		idmKyc: {
			type: Boolean,
			default: false,
			set: function(idmKyc) {
				this._isModifiedIdmKyc = true;
				this._idmKyc = this.verification.idmKyc;
				return idmKyc;
			}
		},
		idmKyc_status: {
			type: String,
			default: 'Not Verified',
			set: function(idmKyc_status) {
				this._isModifiedIdmKycStatus = true;
				this._idmKyc_status = this.verification.idmKyc_status;
				return idmKyc_status;
			}
		},
		Kyc_date: { type: Date },
		amlOverride: {
			type: Boolean,
			default: false,
			set: function(amlOverride) {
				this._isModifiedAmlOverride = true;
				this._amlOverride = this.verification.amlOverride;
				return amlOverride;
			}
		},
		kycOverride: {
			type: Boolean,
			default: false,
			set: function(kycOverride) {
				this._isModifiedKycOverride = true;
				this._kycOverride = this.verification.kycOverride;
				return kycOverride;
			}
		}
	},
	emailVerified: { type: Boolean, default: false },
	// accreditation: {
	// 	ncAccreditation: { type: Boolean, default: false },
	// 	ncAccreditation_status: {
	// 		type: String,
	// 		default: 'Not accredited'
	// 	},
	// 	accreditationOverride: { type: Boolean, default: false },
	// 	accreditation_date: { type: Date },
	// 	ncAccount: String,
	// 	ncAccount_ICO: Array
	// },
	accreditation: {
		type: Array,
		default: [
			{
				ncAccreditation: false,
				ncAccreditation_status: { type: String, default: 'Not accredited' },
				accreditationOverride: { type: Boolean, default: false },
				accreditation_date: { type: Date, default: Date.now },
				ncAccount: { type: String, default: '' },
				_ico: { type: String, default: '' }
			}
		]
	},
	partyId: String,
	idmAccountId: { type: String },
	defaultIco: { type: String },
	verifyToken: { type: String, select: false }
},
{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

InvestorSchema.pre('save', function(next) {
	// get the current date
	var currentDate = new Date();
	if (this.phone) {
		var trimSymbols = this.phone.toString();
		trimSymbols = trimSymbols.replace(/[^\d]/g, '');
		this.phone = parseInt(trimSymbols);
	}
	// change the updated_at field to current date
	this.updated_at = currentDate;
	next();
});

InvestorSchema.pre('save', function(next) {
	const oldIdmKey = this._idmKyc;
	const oldkycOverride = this._kycOverride;

	if (
		(this._isModifiedIdmKyc &&
			((_.isNil(oldIdmKey) || !oldIdmKey) && this.verification.idmKyc)) ||
		(this._isModifiedKycOverride &&
			((_.isNil(oldkycOverride) || !oldkycOverride) &&
				this.verification.kycOverride))
	) {
		this.verification.Kyc_date = moment.utc(Date.now());
		const data = {
			email: this.email,
			tp_name: 'Verification successful',
			global_merge_vars: [],
			tags: ['verification successful']
		};
		background.sendMail(data);
	}

	next();
});

// InvestorSchema.pre('save', function(next) {
// 	if (this._isModifiedIdmAccountId) {
// 		if (_.isNil(this._idmAccountId) && !_.isNil(this.idmAccountId)) {
// 			const data = {
// 				email: this.email,
// 				tp_name: 'Verification submitted',
// 				global_merge_vars: [],
// 				tags: ['verification submitted']
// 			};
// 			sendMail(data);
// 		}
// 		this._isModifiedIdmAccountId = false;
// 	}
// 	next();
// });

InvestorSchema.pre('save', function(next) {
	if (this._isModifiedIdmKycStatus) {
		if (this._idmKyc_status != this.verification.idmKyc_status) {
			this.verification.Kyc_date = moment.utc(Date.now());
		}

		if (
			(this._idmKyc_status == 'Pending' || this._idmKyc_status == 'Verified') &&
			this.verification.idmKyc_status == 'Not Verified'
		) {
			const data = {
				email: this.email,
				tp_name: 'Verification unsuccessful',
				global_merge_vars: [],
				tags: ['verification unsuccessful']
			};
			background.sendMail(data);
		}
	}
	next();
});

InvestorSchema.pre('save', function(next) {
	if (this._isModifiedIdmStatus) {
		if (
			(this._idmAml_status == 'Pending' || this._idmAml_status == 'Verified') &&
			this.verification.idmAml_status == 'Not Verified'
		) {
			const data = {
				email: this.email,
				tp_name: 'Verification unsuccessful',
				global_merge_vars: [],
				tags: ['verification unsuccessful']
			};
			background.sendMail(data);
		}
	}
	next();
});

InvestorSchema.pre('save', function(next) {
	if (this.password != undefined) {
		const saltRounds = 11;
		bcrypt.hash(this.password, saltRounds, (err, hash) => {
			this.password = hash;
			next();
		});
	} else {
		next();
	}
});

InvestorSchema.pre('save', function(next) {
	if (this.investAs === 'Entity') {
		if (this.companyName == null || this.companyName == '') {
			var err = new Error(
				'Please input companyName field, companyName is required!'
			);
			next(err);
		} else {
			next();
		}
	} else {
		next();
	}
});

InvestorSchema.pre('save', function(next) {
	if (this._isModifiedIdmAml) {
		const oldIdmAml = this._idmAml;
		if (oldIdmAml == true && this.verification.idmAml == false) {
			if (this.investAs === 'Entity') {
				ncCall.updateEntity(this, 'AMLstatus', 'Disapproved');
			} else ncCall.updateParty(this, 'AMLstatus', 'Disapproved');
		} else if (oldIdmAml == false && this.verification.idmAml == true) {
			this.verification.Aml_date = moment.utc(Date.now());
			if (this.investAs === 'Entity') {
				ncCall.updateEntity(this, 'AMLstatus', 'Manually Approved');
			} else ncCall.updateParty(this, 'AMLstatus', 'Manually Approved');
		}
	}

	if (this._isModifiedIdmKyc) {
		const oldIdmKyc = this._idmKyc;
		if (oldIdmKyc == false && this.verification.idmKyc == true) {
			if (this.investAs === 'Entity') {
				ncCall.updateEntity(this, 'KYCstatus', 'Manually Approved');
			} else ncCall.updateParty(this, 'KYCstatus', 'Manually Approved');
		} else if (oldIdmKyc == true && this.verification.idmKyc == false) {
			if (this.investAs === 'Entity') {
				ncCall.updateEntity(this, 'KYCstatus', 'Disapproved');
			} else ncCall.updateParty(this, 'KYCstatus', 'Disapproved');
		}
	}

	next();
});

InvestorSchema.pre('save', function(next) {
	if (
		this._isModifiedAmlOverride &&
		(this._amlOverride == false && this.verification.amlOverride == true)
	) {
		this.verification.Aml_date = moment.utc(Date.now());
	}

	next();
});

mongoose.model('investors', InvestorSchema);
