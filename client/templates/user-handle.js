Template.register.events({
    'submit form': function(event) {
        event.preventDefault();
        var email = event.target.registerEmail.value;
        var password = event.target.registerPassword.value;
        var firstname = event.target.registerFirstname.value;
        var lastname = event.target.registerLastname.value;
        var user = {'email':email,'password':password,profile:{name:firstname +" "+lastname}};

        Accounts.createUser(user,function(err){
            if(!err) {
                Router.go('/dashboard');
            }
        });
    },

});

Template.login.events({
    'submit .login-form': function (event) {
        event.preventDefault();
        var email = event.target.email.value;
        var password = event.target.password.value;
        
        Meteor.loginWithPassword(email,password,function(err){
            if(!err) {
                Router.go('/dashboard');
            }
        });
    },

    'click .btn-facebook':function(event){
        event.preventDefault();
        Meteor.loginWithFacebook(function(err){
            if(!err) {
                Router.go('/');
            }
        });
    }
});