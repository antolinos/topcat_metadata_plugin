


(function() {
    'use strict';

    var app = angular.module('topcat');
    
    app.controller('BrowseDatasetController', function($state, tc){
    	var that = this;
    	var investigationId = $state.params.investigationId;
    	var icat = tc.icat($state.params.facilityName);
	

    	this.datasets = [];

    	icat.query([
    		"select dataset from Dataset dataset, dataset.investigation as investigation",
    		"where investigation.id = ? INCLUDE dataset.parameters.type, dataset.type", investigationId
    	]).then(function(datasets){
    		that.datasets = datasets;
                /** Setting parameters at level of Dataset **/
		
		for (var i =0; i < datasets.length; i++){
			console.log(datasets[i].id);
			for (var j =0; j < datasets[i].parameters.length; j++){
			                console.log(datasets[i].parameters[j].type.name + " " + datasets[i].parameters[j].stringValue);
					datasets[i][datasets[i].parameters[j].type.name] = datasets[i].parameters[j].stringValue;

			}
		}
		

    	});

    });

 

})();

