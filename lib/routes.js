// Global loading & 404 templates.
Router.configure({
	notFoundTemplate: 'notFound',
	layoutTemplate: 'main',
	loadingTemplate: 'loading'
});
// Before action show loading page.
Router.onBeforeAction('loading');

Router.map(function() {
	this.route('home', {
		path: '/',
		template: 'landingPage'
	});


	this.route('register', {
		path: '/register',
    	template: 'register'
	}),

	this.route('login', {
		path: '/login',
    	template: 'login'
	}),

	this.route('dashboard', {
		path: '/dashboard',
		template: 'dashboard'
	}),

	this.route('cwplayer/:id', {
		path: '/cwplayer/:_id',
		template: 'cwPlayer'
	})
});