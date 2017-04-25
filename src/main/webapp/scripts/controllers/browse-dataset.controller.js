


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
    		"where investigation.id = ? INCLUDE  dataset.investigation, dataset.parameters.type, dataset.type", investigationId
    	]).then(function(datasets){
    		that.datasets = datasets;

		/** This function parse the white-space separated array and fill an object as property of the dataset dataset["newName"] **/
		function parseNameAndValues(dataset, newName, names, values){
			dataset[newName] = [];
			try{
				if (values != null){
					if (names != null){						
						var values = values.trim().split(/\s+/);
						var names = names.trim().split(/\s+/);
						for(var x = 0; x < values.length; x++){
							dataset[newName].push({name:names[x], value:values[x]});
						}
					}
				}
			}
			catch(e){
				console.log(e);
			}
		}

                /** Setting parameters at level of Dataset **/
		for (var i =0; i < datasets.length; i++){
			var dataset = datasets[i];
						
			for (var j =0; j < dataset.parameters.length; j++){			           										
			    dataset[dataset.parameters[j].type.name] = dataset.parameters[j].stringValue;
			    console.log(dataset.parameters[j].type.name + ":" + dataset.parameters[j].stringValue);
			}
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
			if (dataset.proposal == null){
				dataset.proposal = dataset.investigation.name.replace("-", "");
			}

			/** Parsing optics from generic parameters **/
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

    });

 

})();

