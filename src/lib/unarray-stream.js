let stream = require('stream'),
	util = require('util'),
	Transform = stream.Transform || require('readable-stream').Transform;

util.inherits(Unarray, Transform);

function Unarray() {
	Transform.call(this, {objectMode: true});
}

Unarray.prototype._transform = function (data, enc, cb) {
	// TODO: Error handling
	// http://stackoverflow.com/questions/21771220/error-handling-with-node-js-streams

	//TODO: first post is laways being filtered out. need to find out why.
	let isEnd = false;
	if(!data) return;
	let objs = data.toString().split(/}[\r\n]?,?[\r\n]/);
	objs.forEach(obj => {
		if(obj.startsWith('[') || obj.endsWith(']') || obj.startsWith(',')) {
			return;
		}

		obj += '}';

		this.push(JSON.parse(obj));
	});
	
	cb();
}

module.exports = new Unarray();