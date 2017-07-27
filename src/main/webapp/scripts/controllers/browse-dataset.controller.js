


(function() {
    'use strict';

    var app = angular.module('topcat');
    
    app.controller('BrowseDatasetController', function($state, tc){
    	var that = this;
    	var investigationId = $state.params.investigationId;
    	var icat = tc.icat($state.params.facilityName);
	
    	this.datasets = [];
	
	var page = 1;
	var pageSize = 2000000;

	/**
		Input: [[33159400, "BY15_thin_zoom1", "2017-05-05T10:24:14.287+02:00", "2017-05-05T12:37:38.030+02:00", "InstrumentSlitPrimary_vertical_offset", "0.4125", null]]
		Output: {"id":33159400,"name":"BY15_thin_zoom1","startDate":"2017-05-05T10:24:14.287+02:00","endDate":"2017-05-05T12:37:38.030+02:00","InstrumentSlitPrimary_vertical_offset":"0.4125"}
	**/
	this.parseDataset = function(unparsedDataset){	
		var dataset = {};
		if (unparsedDataset){
			dataset.id = unparsedDataset[0][0];
			dataset.name = unparsedDataset[0][1];
			dataset.startDate = unparsedDataset[0][2];
			dataset.endDate = unparsedDataset[0][3];
			dataset.proposal = unparsedDataset[0][4];
			
			for (var i = 0; i < unparsedDataset.length; i++){				
				dataset[unparsedDataset[i][unparsedDataset[i].length - 3]] = unparsedDataset[i][unparsedDataset[i].length - 2];
			}
		}
		
		return dataset;
	};

	this.load = function(){		
	    	var promise = icat.query([
	    		    "SELECT dataset.id, dataset.name, dataset.startDate, dataset.endDate,investigation.name, parameterType.name, parameter.stringValue, parameter.numericValue ",
			    "FROM DatasetParameter as parameter ",
			    "JOIN parameter.dataset dataset ",
			    "JOIN parameter.type parameterType ",
			    "JOIN dataset.investigation investigation ",
			    "where investigation.id = ? limit ?, ?", investigationId, (page - 1) * pageSize, pageSize
	    	]);

		promise.catch(function(error){
			alert("There was an error: " + error.message);
		});

		promise.then(function(parameters){
			/** Position 0 is datasetId **/			
			var unparsedDatasets = _.groupBy(parameters, 0);
			for (var key in unparsedDatasets){
				that.datasets.push(that.parseDataset(unparsedDatasets[key]));
			}
				
			/** This function parses a white-space separated array and fill an object as property of the dataset dataset["newName"] **/
			function parseNameAndValues(dataset, newName, names, values){			
				try{
					if ((values != null)&&(names != null)){																
							dataset[newName] = _.zipWith(names.trim().split(/\s+/), values.trim().split(/\s+/), function(item, value) {
							    return { "name" :item, "value": value };
							});					
					}
				}
				catch(e){
					console.log(e);
				}
			}

		        /** Setting parameters at level of Dataset **/
			for (var i =0; i < that.datasets.length; i++){
				var dataset = that.datasets[i];
						debugger				
				/** Definiton for MX is not set yet and for tomo is scanType **/
				if (!dataset.definition){
					if (dataset.scanType){
						dataset.definition = dataset.scanType;
					}
					if (dataset.MX_dataCollectionId){
						dataset.definition = 'MX';
					}
					if (dataset.SAXS_experimentType){
						dataset.definition = 'BIOSAXS';
					}
				}
				

				/** Parsing optics from generic parameters **/
				debugger
				parseNameAndValues(dataset, "InstrumentOpticsPositioners", dataset.InstrumentOpticsPositioners_name, dataset.InstrumentOpticsPositioners_value);
				parseNameAndValues(dataset, "InstrumentInsertionDeviceTaper", dataset.InstrumentInsertionDevice_taper_name, dataset.InstrumentInsertionDevice_taper_value);
				parseNameAndValues(dataset, "InstrumentInsertionDeviceGap", dataset.InstrumentInsertionDevice_gap_name, dataset.InstrumentInsertionDevice_gap_value);
				parseNameAndValues(dataset, "InstrumentDetector01", dataset.InstrumentDetector01Positioners_name, dataset.InstrumentDetector01Positioners_value);
				parseNameAndValues(dataset, "InstrumentDetector02", dataset.InstrumentDetector02Positioners_name, dataset.InstrumentDetector02Positioners_value);
				parseNameAndValues(dataset, "InstrumentDetector03", dataset.InstrumentDetector03Positioners_name, dataset.InstrumentDetector03Positioners_value);
				parseNameAndValues(dataset, "InstrumentDetector04", dataset.InstrumentDetector04Positioners_name, dataset.InstrumentDetector04Positioners_value);
				parseNameAndValues(dataset, "InstrumentDetector05", dataset.InstrumentDetector05Positioners_name, dataset.InstrumentDetector05Positioners_value);
				parseNameAndValues(dataset, "InstrumentDetector06", dataset.InstrumentDetector06Positioners_name, dataset.InstrumentDetector06Positioners_value);
				parseNameAndValues(dataset, "InstrumentDetector07", dataset.InstrumentDetector07Positioners_name, dataset.InstrumentDetector07Positioners_value);
				parseNameAndValues(dataset, "InstrumentDetector08", dataset.InstrumentDetector08Positioners_name, dataset.InstrumentDetector08Positioners_value);
				parseNameAndValues(dataset, "InstrumentDetector09", dataset.InstrumentDetector09Positioners_name, dataset.InstrumentDetector09Positioners_value);
				parseNameAndValues(dataset, "InstrumentDetector10", dataset.InstrumentDetector10Positioners_name, dataset.InstrumentDetector10Positioners_value);
		                    
				/** MX **/
				parseNameAndValues(dataset, "MX_Motors", dataset.MX_motors_name, dataset.MX_motors_value);
			

		                /** Deprecated to ID16a **/
				parseNameAndValues(dataset, "OpticsSensors", dataset.optics_sensors_labels, dataset.optics_sensors_values);
				parseNameAndValues(dataset, "SampleSensors", dataset.sample_sensors_labels, dataset.sample_sensors_values);
				parseNameAndValues(dataset, "DetectorMotors", dataset.detectors_motors, dataset.detectors_positions); 
		                parseNameAndValues(dataset, "OpticsMotors", dataset.optics_motors, dataset.optics_positions);      	                                 
			
			}						

	    	});
	};

	this.load();
});


 

})();

