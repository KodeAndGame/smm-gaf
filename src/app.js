let Xray = require('x-ray'),
	xray = Xray(),
	threadUrl = 'http://www.neogaf.com/forum/showthread.php?t=1109852';


xray(threadUrl, 'div[id^=edit]', [{
	postNumber: '.post-meta .right strong',
	poster: '.postbit-details-username a',
	subject: '.post-meta-border strong', 
	body: '.post'
}])
.paginate('a[rel="next"]@href')
.delay(50, 100)
.limit(3)
.write('out.json')