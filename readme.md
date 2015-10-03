Aggregate Super Mario Maker levels and data around those levels posted in the NeoGAF OT (Official Thread)

###WIP Data Schema###
  thread {
    threadId
    isOt
    latestPost
    finalPost
  }

  post {
    postCount
    friendlyId
    postId
    url
    poster
    subject
    time
    isMod
    body
    tokens
  }

###Token Types###
- Text Fragment (e.g. p or br tag)
	- body
	- sentiment
- Embedded Image (stored in db)
	- **Q**: can this be part of a text fragment 
	- parsedText
	- levelCodes
- External Link (stored in db)
	- **Q**: can this be part of a text fragment 
	- levelCodes
	- text??
- Internal Link (turns into a cited quote?)
	- **Q**: can this be part of a text fragment 
	- text??
- Cited Quote
	- levelCodes
- Level Code (splits a text fragment if contained within)
