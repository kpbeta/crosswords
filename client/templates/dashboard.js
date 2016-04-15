import {PairCollections} from '../../lib/collections.js';	

Template.dashboard.helpers({
	globalCollections: function() {
		return PairCollections.find({'global': 1});
	},
	personalCollections: function() {
		console.log('thisUser is '+ Meteor.userId());
		return PairCollections.find({'uploadederID': Meteor.userId()});
	}
	
})