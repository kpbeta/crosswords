import {Pairs} from '../../lib/collections.js';

Template.creator.events({
	'submit form': function(event) {
		event.preventDefault();

		let target = event.currentTarget;

		let colTitle = target.colTitle.value;
		let colDesc = target.colDesc.value;
		let colPairs = target.colPairs.value;
		let colGlobal = (target.colGlobal.value == "on")?1:0;

		Pairs.insert({title: colTitle,
						uploaderId: Meteor.userId(),
						desc: colDesc,
						pairs: colPairs,
						global: colGlobal});
		Router.go('dashboard');		
	}

});