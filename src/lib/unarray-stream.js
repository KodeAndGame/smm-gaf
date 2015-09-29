let stream = require('stream'),
	util = require('util'),
	Transform = stream.Transform || require('readable-stream').Transform;

util.inherits(Unarray, Transform);

function Unarray() {
	Transform.call(this, {objectMode: true});
}

Unarray.prototype._transform = function (data, enc, cb) {
	let isEnd = false;
	if(!data) return;
	let objs = data.toString().split(/}[\r\n]?,?[\r\n]/);
	objs.forEach(obj => {

		//replace array-specific stuff
		obj = obj
			.replace(/^\[/, '')
			.replace(/^,/, '')
			.replace(/\]$/, '');

		//check for non whitespace
		if(!obj.match(/\S/)) return;

		//add back the curly brace removed from the split
		obj += '}';

		this.push(JSON.parse(obj));
	});
	
	cb();
}

module.exports = new Unarray();