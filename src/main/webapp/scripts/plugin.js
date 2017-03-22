

registerTopcatPlugin(function(pluginUrl){
	return {
		scripts: [
			pluginUrl + 'scripts/controllers/browse-dataset.controller.js'
		],

		stylesheets: [],

		configSchema: {
			//see https://github.com/icatproject/topcat/blob/master/yo/app/scripts/services/object-validator.service.js
		},

		setup: function($uibModal, tc){

			tc.ui().registerBrowseGridAlternative('dataset', pluginUrl + 'views/browse-dataset.html', {
				controller: 'BrowseDatasetController as browseDatasetController'
			});

		}
	};
});

