import {Pairs} from '../../lib/collections.js';
import {OnlinePlayers} from '../../lib/collections.js';
import {scores} from '../../lib/collections.js';

var online = 0;
var selectedOnlineUser = 0;
Template.dashboard.events({
	'click .onlineToggle': function(event) {
		event.preventDefault();
		online = 1 - online;
		console.log(online);
	},

	'click .play-online-button': function(event) {
		event.preventDefault();
		if (online) {
			$('.dashboardTabs').removeClass("active");
			$('.peopleTab').addClass("active");
			alert("Helo");
		} else {
			// alert("Change your status to online to play with people online.");
		}

		
	}
})


Template.dashboard.helpers({
	globalCollections: function() {
		console.log("We running");
		console.log(Pairs.find({'global': 1}));
		return Pairs.find({$and: [{'global': 1}, {'uploaderID': {$not: Meteor.userId()}}]});
	},
	
	personalCollections: function() {
		console.log('thisUser is '+ Meteor.userId());
		return Pairs.find({$and: [{'uploaderId': Meteor.userId()}, {'global': 0}]});
	}
	
})