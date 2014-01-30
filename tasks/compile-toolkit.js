/**
 * Concat toolkit modules and remove all require definitions
 */

"use strict";

module.exports = function (grunt) {

	// modules
	var fs = require("fs"),
		requirejs = require("requirejs"),
		mkpath = require("mkpath");

	// requirejs config
	var config = {
		baseUrl: "src/toolkit/js",
		mainConfigFile: "src/toolkit/js/toolkit.js",
		name: "toolkit",
		optimize: "none",
		wrap: {
			startFile: "src/toolkit/js/build/intro.js",
			endFile: "src/toolkit/js/build/outro.js"
		}
	};


	/**
	 * Strip all definitions generated by requirejs
	 * @param {String} name
	 * @param {String} path
	 * @param {String} contents The contents to be written (including their AMD wrappers)
	 */
	config.onBuildWrite = function (name, path, contents) {

		var rdefineEnd = /\}\);[^}\w]*$/;

		// Remove define wrappers, closure ends, and empty declarations
		contents = contents
			.replace(/define\([^{]*?{/g, "")
			.replace(rdefineEnd, "");

		// Remove require wrappers
		contents = contents
			.replace(/require\([^{]*?{/g, "")
			.replace(rdefineEnd, "");

		// Remove require.config blocks
		contents = contents
			.replace(/require.config\([^{]*?{([^}]+)}\);/g, "");

		// Remove empty definitions
		contents = contents
			.replace(/define\([^{]*?{}\);/, "");

		// remove "toolkit" return statements
		contents = contents
			.replace(/\s*return\s+(toolkit)+;/, "");

		return contents;

	};

	// remove last define on save out
	config.out = function (text) {
		var contents = text.replace(/define\([^{]*?{}\);/, "");
		mkpath.sync("dist/toolkit/js/");
		fs.writeFileSync("dist/toolkit/js/toolkit.js", contents);
	};


	// register grunt task
	grunt.registerTask("compile-toolkit-js", "Build", function () {

		var done = this.async();

		requirejs.optimize(config, function (response) {
			grunt.log.writelns(response);
			done();
		}, function (err) {
			done(err);
		});

	});

};