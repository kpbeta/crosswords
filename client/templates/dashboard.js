import {Pairs} from '../../lib/collections.js';
import {Scores} from '../../lib/collections.js';

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
			// alert("Helo");
		} else {
			// alert("Change your status to online to play with people online.");
		}

		
	}
})


Template.dashboard.helpers({
	globalCollections: function() {
		return Pairs.find({$and: [{'global': 1}, {'uploaderID': {$not: Meteor.userId()}}]});
	},
	
	personalCollections: function() {
		return Pairs.find({$and: [{'uploaderId': Meteor.userId()}, {'global': 0}]});
	},

	personalScores: function() {
		return Scores.find({'userId': Meteor.userId()});
	}
	
})