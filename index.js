const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const request = require('request');
const moment = require('moment');
const keys = require('./config/keys');
const fileUpload = require('./services/fileUpload');
const worker = require('./services/worker');
const requestIp = require('request-ip');
const Raven = require('raven');

require('./models/AdminUser');
require('./models/Investor');
require('./models/Icos');
require('./models/xRate');
require('./models/RateLogs');
require('./models/Transaction');
require('./models/Captable');
require('./models/Withdrawals');
require('./models/Wallets');
require('./models/UserLog');
require('./models/IcoSub');
require('./models/InvestorDocs');
require('./services/passport');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });

var allowCrossDomain = function(req, res, next) {
	let allowedOrigins = ['https://my.tokenhub.com'];
	let origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Origin', origin); // restrict it to the required domain
	}
	//res.header('Access-Control-Allow-Origin');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.header('Access-Control-Allow-Credentials', 'true');

	next();
};

const app = express();

const logger = morgan('dev');
const userLog = require('./middlewares/userLog');
const requireLogin = require('./middlewares/requireLogin');

Raven.config(`https://${keys.ravenKey}@sentry.io/${keys.ravenProject}`).install();
// app.use(Raven.requestHandler());
// app.get('/', function mainHandler(req, res) {
// 	throw new Error('Broke!');
// });
// app.use(Raven.errorHandler());
// app.use(function onError(err, req, res, next) {
// 	Raven.captureException(err);
// });

app.use(bodyParser.text({ type: 'text/json' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const maxAge = 60 * 30 * 1000; // 30 minutes

app.use(
	cookieSession({
		maxAge,
		keys: [keys.cookieKey]
	})
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(requestIp.mw());
app.use(allowCrossDomain);
app.use(
	morgan('dev', {
		skip: function(req, res) {
			userLog(res);
			return true;
		}
	})
);

require('./routes/authRoutes')(app);
require('./routes/investorRoutes')(app);
require('./routes/icoRoutes')(app);
require('./routes/xRateRoutes')(app);
require('./routes/mfaRoutes')(app);
require('./routes/transactionsRoutes')(app);
require('./routes/captableRoutes')(app);
require('./routes/withdrawalRoutes')(app);
require('./routes/walletsRoutes')(app);
require('./routes/icoSubRoutes')(app);
require('./routes/LepricoinWorker')(app);
require('./routes/cronJobsRoutes')(app);
require('./routes/portfolioRoutes')(app);
require('./routes/adminRoutes')(app);
require('./routes/kycAmlRoutes')(app);

if (process.env.NODE_ENV === 'production') {
	// Express will serve up production assets like main.js or main.css
	app.use(express.static('client/build'));

	// Express will serve up index.html if it doesnt recognize the routes
	const path = require('path');
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log('Express server listenings on port ' + PORT);

worker.subscribe();
mongoose.disconnect();
