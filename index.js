'use strict';

var glModuleName = 'require-directory';

var fs = require('fs');
var path = require('path');

// Returns `true` if NODE_DEBUG environment variable is set and has the module name in it
var isInDebugMode = function() {
    if (!process.env.NODE_DEBUG)
	return false;
    return -1 !== process.env.NODE_DEBUG.split(' ').indexOf(glModuleName);
};

// Returns an array of files in a directory
var getDirectoryContent = function(dir) {
    var dirPath = path.resolve(dir);
    var stat = fs.statSync(dirPath);

    if (!stat.isDirectory())
	throw new Error('File "' + dir + '" is not a directory');

    return fs.readdirSync(dirPath);
};

// Returns `true` if the file has a require()'able extension
var isRequirableFile = function(file, extensions) {
    return -1 !== extensions.indexOf(path.extname(file));
};

// Options:
// {
//     debug: Boolean, default false
//     defer: Boolean, default true
//     extensions: Array, default Object.keys(require.extensions)
//     onlyFiles: Boolean, default true
//     recursive: Boolean, default false
//     requireFunction: Function, default require
//     stripExtension: Boolean, default true
// }
module.exports = function(dir, options) {
    options = options || {};

    // If true, will output warnings on stdout
    options.debug = options.debug || isInDebugMode() || false;
    // If true, will look in subdirectories
    options.recursive = options.recursive || true;
    // If true, will not require() the files directly, but files
    // will be required when accessed for the first time
    options.defer = options.defer || false;
    // If true and options.recursive set to false, will not
    // require folders
    options.onlyFiles = options.onlyFiles || true;
    // If true, will strip extension in field name in returned
    // object
    options.stripExtension = options.stripExtension || true;
    // Require function
    options.requireFunction = options.requireFunction || require;
    // Accepted extensions
    options.extensions = options.extensions || Object.keys(require.extensions);

    var dirContent = getDirectoryContent(dir);

    var requiredFiles = {};
    dirContent.forEach(function(elem) {
	var fullElemPath = path.resolve(dir) + '/' + elem;
	var fileStat = fs.statSync(fullElemPath);

	if (options.stripExtension)
	    elem = path.basename(elem, path.extname(elem));

	if ((!options.recursive && options.onlyFiles) && !fileStat.isFile()) {
	    options.debug && console.log('Excluded "' + fullElemPath + '" because it is not a file and options.onlyFiles is set to `true`');
	    return ; // Not a file and option to also require() others set to false
	}

	// Is a directory that needs to be recursed on
	if (options.recursive && fileStat.isDirectory())
	    requiredFiles[elem] = module.exports(fullElemPath);
	// Is not a Node.js require()'able file
	else if (!isRequirableFile(fullElemPath, options.extensions)) {
	    options.debug && console.log('Excluded "' + fullElemPath + '" because it is not requirable');
	    return ; // Not requirable
	}
	// Deferred require()
	else if (options.defer)
	    Object.defineProperty(requiredFiles, elem, {
		get: function() { return options.requireFunction(fullElemPath); },
		enumerable: true,
	    });
	// Default
	else
	    requiredFiles[elem] = options.requireFunction(fullElemPath);
    });

    return requiredFiles;
};
