module.exports = function (app, passport) {



	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function (req, res) {
		res.render('index.ejs');
		// load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	// app.get('/login', function(req, res) {

	// 	// render the page and pass in any flash data if it exists
	// 	res.render('login.ejs', { message: req.flash('loginMessage') });
	// });

	// process the login form
	app.post('/', passport.authenticate('local-login', {
		successRedirect: '/chat', // redirect to the secure profile section
		failureRedirect: '/', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/register', function (req, res) {

		// render the page and pass in any flash data if it exists
		res.render('register.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/register', passport.authenticate('local-signup', {

		successRedirect: '/', // redirect to the secure profile section
		failureRedirect: '/register', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}
	), function (req, res) {
		console.log(req)
	});


	app.get('/chat', function (req, res) {
		if (req.user.facebook.name == undefined) {
			finalName = req.user.local.username;
		}
		else
			finalName = req.user.facebook.name;
		res.render('chat.ejs');

	})


	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function (req, res) {
		res.render('profile.ejs', {
			user: req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	// route for facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect: '/chat',
			failureRedirect: '/'
		}));

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/api/time', function (req, res, next) {
		var date = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ending = " AM";

		if (hours > 12) {
			hours -= 12;
			ending = " PM"
		} else if (hours === 0) {
			hours = 12;
		}

		var currentTime = hours + ":" + minutes + ending;
		console.log(hours, minutes);
		res.json(currentTime); //convert to actual json JSON.parse(text)
	});

	app.get('/api/date', function (req, res, next) {
		var monthNames = [
			"January", "February", "March",
			"April", "May", "June", "July",
			"August", "September", "October",
			"November", "December"
		];
		var date = new Date();
		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();
		var currentDate = day + ' ' + monthNames[monthIndex] + ' ' + year;
		// console.log(day, monthNames[monthIndex], year);
		console.log(currentDate);
		res.json(currentDate); //convert to actual json JSON.parse(text)
	});

	app.post('/chat', function (req, res) {
		var chat = req.body.message - input;

		var newChat = new msgModel();
		newChat.messages = chat;
		newChat.save(function (err, savedObject) {
			if (err) {
				console.log(err);
				res.status(500).send();
			}
			else {
			}
		});
	});

};


// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

