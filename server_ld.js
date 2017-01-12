var http = require('http');
var fs = require('fs');
var path = require('path');
var components = bufferFile('/components.txt');
var LaunchDarkly = require('ldclient-node');

var log = function(n,e) { console.log(n + '->' + e); }

var config = { logger : {
error: log,
info : log,
warn : log,
verbose : log,
debug : log,
silly : log
},
stream : false
};

config.logger = null;

var client = LaunchDarkly.init("sdk-1565df04-39b9-4e01-a3c8-45a8f8460d24",config);

var user = {
  "firstName": "Bob",
  "lastName": "Loblaw",
  "key": "bob@example.com",
  "custom": {
    "groups": "beta_testers"
  }
};

function bufferFile(relPath) {
    return fs.readFileSync(path.join(__dirname, relPath), 'utf8');
}

function isEnabled(togglename){
  console.log("Checking feature: " + togglename);
  var result = false;
  client.variation(togglename, user, false, function(err, showFeature) {
    if (showFeature) {
      // application code to show the feature
      console.log("Feature: " + togglename + " is enabled for " + user.key );
      result = true;
    } else {
      // the code to run if the feature is off
      console.log("Feature: " + togglename + " is disabled for " + user.key);
      result = false;
    }
});

console.log("Feature checked.");
return result;

}

function isFeatureEnabled(version){
  	if(version == 'v0'){
  		return { create : false, save : false, delete : false };
  	}

  	if(version == 'v1'){
  		return { create : true, save : false, delete : false };
  	}
  	if(version == 'v2'){
  		return { create : true, save : true, delete : false };
  	}

  	if(version == 'v3'){
  		return { create : true, save : true, delete : true };
  	}

  	throw 'Version not supported';
}

function httpServer(request, response) {
//console.log(new Date().getTime() + " Waiting for LD client...");
//client.once('ready', function()
//console.log(new Date().getTime() + " LD client ready..");

response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

	var version = bufferFile("/version.txt");
	var features = JSON.parse(bufferFile("/features.json"));

  var html = '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="1500">' + components + '<title>Feature Toggles</title></head><body>';
  html += '<div class="container-fluid"><h1>Welcome to toggle app ' + version +'.0</h1><div class="form-group col-md-4">';

	//console.log(new Date().getTime() + ' ' + version + ': ' + JSON.stringify(features));

	html += '<div class="alert alert-' + features.mode + '" role="alert">Messages will appear here !</div>';

	html += '<div class="list-group"><button type="button" class="list-group-item">Cras justo odio</button><button type="button" class="list-group-item">Dapibus ac facilisis in</button><button type="button" class="list-group-item">Morbi leo risus</button><button type="button" class="list-group-item">Porta ac consectetur ac</button><button type="button" class="list-group-item">Vestibulum at eros</button></div>';
	html += '<div class="btn-group">'

	html += '<button class="btn btn-primary">Edit</button>';

	 if(isEnabled("create-button")) {
		html += '<button class="btn btn-success">Create</button>';
	  }

    if(isEnabled("save-button")){
	    html += '<button class="btn btn-warning">Save</button>';
    }

    if(isEnabled("delete-button")){
	    html += '<button class="btn btn-danger">Delete</button>';
    }

	html += '</div>';
  html += '</div></div></body></html>';

  response.end(html, 'utf-8');
}

console.log(new Date().getTime() + " Waiting for LD client...");
client.once('ready', function() {
console.log("LD client is ready.");

http.createServer(httpServer).listen(1337, '0.0.0.0');

  //    client.flush(function() {
 //      client.close();
 //     });
  });


console.log('Server running!');
