import {PairCollections} from '../../lib/collections.js';	

Template.dashboard.events({
	
})


Template.dashboard.helpers({
	globalCollections: function() {
		console.log("We running");
		console.log(PairCollections.find({'global': 1}));
		return PairCollections.find({'global': 1});
	},
	
	personalCollections: function() {
		console.log('thisUser is '+ Meteor.userId());
		return PairCollections.find({'uploadederID': Meteor.userId()});
	}
	
})

$('.dbtab a').click(function (e) {
  e.preventDefault()
  $(this).tab('show')
})

