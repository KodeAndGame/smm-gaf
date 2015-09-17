let Xray = require('x-ray'),
	xray = Xray();

function extractAllPosts() {
	xray('http://www.neogaf.com/forum/showthread.php?t=1109852', 'div[id^=edit]', [{
		postNumber: '.post-meta .right strong',
		poster: '.postbit-details-username a',
		subject: '.post-meta-border strong', 
		body: '.post'
	}])
	.paginate('a[rel="next"]@href')
	.write('posts.json')

	prepDbFiles();
}

function prepDbFiles() {
	let levelPosts = [],
		levelCodes = [],
		uniqueCodes = [];

	posts.forEach(post => {
		let match = post.body.match(/\w{4}-\w{4}-\w{4}-\w{4}/g);
		if(match) {
			levelPosts.push(post);
			levelCodes.push.apply(levelCodes, match);
		}
	});	
	levelCodes.forEach(code => {
		if(uniqueCodes.indexOf(code) < 0) {
			uniqueCodes.push(code);
		}
	});

	fs.writeFile('./data/levelPosts.json', JSON.stringify(levelPosts, null, '  '));
	fs.writeFile('./data/levelCodes.json', JSON.stringify(levelCodes, null, '  '));
	fs.writeFile('./data/uniqueCodes.json', JSON.stringify(uniqueCodes, null, '  '));
}