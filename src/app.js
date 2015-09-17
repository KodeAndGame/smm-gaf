let Xray = require('x-ray'),
	xray = Xray(),
	threadUrl = 'http://www.neogaf.com/forum/showthread.php?t=1109852';


function extractAllPosts() {
		xray(threadUrl, 'div[id^=edit]', [{
		postNumber: '.post-meta .right strong',
		poster: '.postbit-details-username a',
		subject: '.post-meta-border strong', 
		body: '.post'
	}])
	.paginate('a[rel="next"]@href')
	.write('posts.json')
}