
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});

var mysql = require('mysql');

Processor = {};

Processor.process = function (dataObj, callback) {
	// some manipulation of data; just multiplying here
	dataObj.val /= 2222.2;
	callback(dataObj);
}

Processor.initializeConnection = function() {
	Processor.connection = mysql.createConnection({
	  host	 : '***', 
	  user	 : '***', 
	  password : '***', 
	  database : '***'
	});
	Processor.connection.connect();
};

Processor.disconnect = function () {
	Processor.connection.end(function(err) {
		console.log("Disconnect.");
	});
};

Processor.readFile = function (bucket, key, callback) {
	console.log("Getting... "+bucket+" / "+key);
	s3.getObject({Bucket:bucket, Key:key}, function(err,data) {
		if (err) {
			console.log('error getting object ' + key + ' from bucket ' + bucket + ' ::: '+err);
		}
		else {
			var rawData = parseInt(String(data.Body).trim());
			var _date = new Date();
			var dataObj = {
				val: rawData,
				created_at: _date
			};
			console.log('Got content: ', dataObj);
			callback(dataObj);
		}
	});
};

Processor.insertData = function(data) {
	console.log("Inserting: "+data.val+" , "+data.created_at);
	Processor.connection.query("INSERT INTO `processed` SET val=?, created_at=?",
		[ data.val, data.created_at],
		function(err, info){
			console.log("insert: "+info.msg+" /err: "+err);
		}
	);
};

exports.handler = function(event,context){
	console.log('Received event:');
	console.log(JSON.stringify(event, null, '  '));

	// Get the object from the event and show its content type
	var bucket = event.Records[0].s3.bucket.name;
	var key = event.Records[0].s3.object.key;
	console.log("Getting... "+bucket+" / "+key);

	Processor.initializeConnection();
	Processor.readFile(bucket, key, function(dataObj){
		Processor.process(dataObj, function(processedData) {
			console.log("processd: "+processedData.val);
			Processor.insertData({
				val: processedData.val,
				created_at: processedData.created_at
			});
		});
	});

};


