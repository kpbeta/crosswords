Template.creator.events({
	'submit form': function(event) {
		event.preventDefault();

		let target = event.currentTarget;

		let colTitle = target.colTitle.value;
		let colDesc = target.colDesc.value;
		let colPairs = target.colPairs.value;

		Router.go('dashboard');		
	}

});

function getArrayFromText(strPairs){
	
}