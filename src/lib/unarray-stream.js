let stream = require('stream');
let util = require('util');
let Transform = stream.Transform || require('readable-stream').Transform;

util.inherits(Unarray, Transform);

function Unarray() {
	Transform.call(this, {objectMode: true});
}

Unarray.prototype._transform = function (data, enc, cb) {
	if(!data) return;
	let objs = data.toString().split(/},?[\r\n]/)
	objs.forEach(obj => {
		if(obj.startsWith('[')) {
			obj = obj.substring(1)
		}
		if(obj.endsWith(']')) {
			obj = obj.substring(0, obj.length - 2);
		}
		obj += '}'
		this.push(obj);
	})
	cb();
}

module.exports = new Unarray();