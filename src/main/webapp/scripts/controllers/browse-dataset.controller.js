


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
    		"where investigation.id = ?", investigationId
    	]).then(function(datasets){
    		that.datasets = datasets;
    	});

    });

})();

