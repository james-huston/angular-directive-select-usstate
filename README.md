# angular-directive-select-usstates

A directive for creating a dropdown of us states.

# Usage

To use this directive, make sure it's loaded in your JS and add it as a dependency to your angular app.

	angular.module('myApp', ['angular-directive-select-usstates']);

The inside of your template drop something like this.

	<ang-select-usstates ng-model="blarg.selectedState" name="State" id="selectState"></ang-select-usstates>

That should give you the dropdown with it's scope connected to the value of blarg.selectedState inside of your controller.

To set a default value, you can set it to the state abbreviation in your controller like such.

    angular.module('myApp', ['angular-directive-select-usstates'])

    .controller('MyAppCtrl', function ($scope) {
      $scope.blarg = { selectedState: 'OH' };
    });

This will cause 'Ohio' to be the selected state when your app loads up.

See examples/index.html for example usage of 2 dropdowns on the same page.

# Developing
This uses grunt watch to build and run it's local testing webserver. Once you download and do an 'npm install' you then run 'grunt watch' and are up and running.

While you are developing it's handy to run the e2e tests. Make sure you have 'grunt watch' running and then do the following from the root.

	grunt karma:e2e
	
This will start another instance of karma up to run the e2e tests. These run when you edit any src/\*\*/* or any tests/e2e/\*\*/* files.