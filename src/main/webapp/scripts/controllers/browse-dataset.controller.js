


(function() {
    'use strict';

    var app = angular.module('topcat');
    
    app.controller('BrowseDatasetController', function($state, tc, tcIcatEntity){
    	var that = this;
    	var investigationId = $state.params.investigationId;
    	var icat = tc.icat($state.params.facilityName);
	
    	this.datasets = [];
	
	this.page = 1;
	this.pageSize = 20*100;
	this.pageCount = 1;

	this.datasetsCountMessage = "";

	this.next = function(){
		that.page = that.page + 1
		that.getPage(that.page);
	}

	this.previous = function(){
		that.page = that.page - 1
		that.getPage(that.page);	
	}
	/**
		Input: [[33159400, "BY15_thin_zoom1", "2017-05-05T10:24:14.287+02:00", "2017-05-05T12:37:38.030+02:00", "InstrumentSlitPrimary_vertical_offset", "0.4125", null]]
		Output: {"id":33159400,"name":"BY15_thin_zoom1","startDate":"2017-05-05T10:24:14.287+02:00","endDate":"2017-05-05T12:37:38.030+02:00","InstrumentSlitPrimary_vertical_offset":"0.4125"}
	**/
	this.parseDataset = function(unparsedDataset){	
		
		var dataset =  tcIcatEntity.create({entityType: 'dataset'}, tc.facility('ESRF'));
		if (unparsedDataset){
			dataset.id = unparsedDataset[0][0];
			dataset.name = unparsedDataset[0][1];
			dataset.startDate = new Date(unparsedDataset[0][2]);
			dataset.endDate = new Date(unparsedDataset[0][3]);

			if (dataset.startDate && dataset.endDate){
				dataset.interval = moment(dataset.endDate).diff(moment(dataset.startDate), 'minutes');
			}
			dataset.proposal = unparsedDataset[0][4];
			
			dataset.parameterList = [];
			for (var i = 0; i < unparsedDataset.length; i++){				
				dataset[unparsedDataset[i][unparsedDataset[i].length - 3]] = unparsedDataset[i][unparsedDataset[i].length - 2];
				dataset.parameterList.push({name : unparsedDataset[i][unparsedDataset[i].length - 3], value : unparsedDataset[i][unparsedDataset[i].length - 2]})
			}

		}

		dataset.parameterList = _.sortBy(dataset.parameterList, 'name');	
		return dataset;
	};

	this.load = function(investigationId){		
		icat.query([
		    "SELECT count(parameter)",
		    "FROM DatasetParameter as parameter ",
		    "JOIN parameter.dataset dataset ",
		    "JOIN parameter.type parameterType ",
		    "JOIN dataset.investigation investigation ",
		    "where investigation.id = ? limit ?, ?", investigationId, (that.page - 1) * that.pageSize, that.pageSize
		]).then(function(result){
		    that.pageCount = _.ceil(result[0] / that.pageSize);
		    that.getPage(that.page);
		});

		icat.query([
		    "SELECT count(dataset)",
		    "FROM Dataset as dataset ",		   
		    "JOIN dataset.investigation investigation ",
		    "where investigation.id = ?", investigationId
		]).then(function(result){
			that.datasetsCountMessage = (result) + " datasets";
		});


	};

	/** This function parses a white-space separated array and fill an object as property of the dataset dataset["newName"] **/
			
	this.parseNameAndValues = function (dataset, newName, names, values){			
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
			};

	this.getPage = function(page){		
	    	var promise = icat.query([
	    		    "SELECT dataset.id, dataset.name, dataset.startDate, dataset.endDate, investigation.name, parameterType.name, parameter.stringValue, parameter.numericValue",			   
			    "FROM DatasetParameter as parameter ",
			    "JOIN parameter.dataset dataset ",			   
			    "JOIN parameter.type parameterType ",
			    "JOIN dataset.investigation investigation ",
			    "where investigation.id = ? limit ?, ?", investigationId, (page - 1) * that.pageSize, that.pageSize
	    	]);

		promise.catch(function(error){			
			console.log("There was an error: " + error.message);
		});

		promise.then(function(parameters){
			that.datasets = [];
			/** Position 0 is datasetId **/			
			var unparsedDatasets = _.groupBy(parameters, 0);
			for (var key in unparsedDatasets){
				that.datasets.push(that.parseDataset(unparsedDatasets[key]));
			}
			/** Sort datasets **/
			that.datasets = _.sortBy(that.datasets, 'startDate').reverse();
				
			

		        /** Setting parameters at level of Dataset **/
			for (var i =0; i < that.datasets.length; i++){
				var dataset = that.datasets[i];
										
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


				that.parseNameAndValues(dataset, "SampleEnvironmentSensors", dataset.SampleEnvironmentSensors_name, dataset.SampleEnvironmentSensors_value);
				that.parseNameAndValues(dataset, "SamplePositioners", dataset.SamplePositioners_name, dataset.SamplePositioners_value);
				that.parseNameAndValues(dataset, "InstrumentEnvironmentSensors", dataset.InstrumentEnvironmentSensors_name, dataset.InstrumentEnvironmentSensors_value);
				that.parseNameAndValues(dataset, "InstrumentOpticsPositioners", dataset.InstrumentOpticsPositioners_name, dataset.InstrumentOpticsPositioners_value);
				that.parseNameAndValues(dataset, "InstrumentInsertionDeviceTaper", dataset.InstrumentInsertionDevice_taper_name, dataset.InstrumentInsertionDevice_taper_value);
				that.parseNameAndValues(dataset, "InstrumentInsertionDeviceGap", dataset.InstrumentInsertionDevice_gap_name, dataset.InstrumentInsertionDevice_gap_value);
				that.parseNameAndValues(dataset, "InstrumentDetector01", dataset.InstrumentDetector01Positioners_name, dataset.InstrumentDetector01Positioners_value);
				that.parseNameAndValues(dataset, "InstrumentDetector02", dataset.InstrumentDetector02Positioners_name, dataset.InstrumentDetector02Positioners_value);
				that.parseNameAndValues(dataset, "InstrumentDetector03", dataset.InstrumentDetector03Positioners_name, dataset.InstrumentDetector03Positioners_value);
				that.parseNameAndValues(dataset, "InstrumentDetector04", dataset.InstrumentDetector04Positioners_name, dataset.InstrumentDetector04Positioners_value);
				that.parseNameAndValues(dataset, "InstrumentDetector05", dataset.InstrumentDetector05Positioners_name, dataset.InstrumentDetector05Positioners_value);
				that.parseNameAndValues(dataset, "InstrumentDetector06", dataset.InstrumentDetector06Positioners_name, dataset.InstrumentDetector06Positioners_value);
				that.parseNameAndValues(dataset, "InstrumentDetector07", dataset.InstrumentDetector07Positioners_name, dataset.InstrumentDetector07Positioners_value);
				that.parseNameAndValues(dataset, "InstrumentDetector08", dataset.InstrumentDetector08Positioners_name, dataset.InstrumentDetector08Positioners_value);
				that.parseNameAndValues(dataset, "InstrumentDetector09", dataset.InstrumentDetector09Positioners_name, dataset.InstrumentDetector09Positioners_value);
				that.parseNameAndValues(dataset, "InstrumentDetector10", dataset.InstrumentDetector10Positioners_name, dataset.InstrumentDetector10Positioners_value);
		                    
				/** MX **/
				that.parseNameAndValues(dataset, "MX_Motors", dataset.MX_motors_name, dataset.MX_motors_value);
			

		                /** Deprecated to ID16a **/
				that.parseNameAndValues(dataset, "OpticsSensors", dataset.optics_sensors_labels, dataset.optics_sensors_values);
				that.parseNameAndValues(dataset, "SampleSensors", dataset.sample_sensors_labels, dataset.sample_sensors_values);
				that.parseNameAndValues(dataset, "DetectorMotors", dataset.detectors_motors, dataset.detectors_positions); 
		                that.parseNameAndValues(dataset, "OpticsMotors", dataset.optics_motors, dataset.optics_positions);      	                                 
			
			}						

	    	});
	};



	this.load(investigationId);
});


 

})();

