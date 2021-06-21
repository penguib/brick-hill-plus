const messageContainer = document.getElementsByClassName("content")[0]
const messageContent = messageContainer.childNodes[3]
const imgurRegex = /https:\/\/(i.)?imgur.com(\/a|\/gallery)?\/[0-9a-zA-Z]+(.png|.gif|.jpg|.jpeg)/g
const discordRegex = /https:\/\/cdn\.discordapp\.com\/attachments\/[0-9]+\/[0-9]+\/[a-zA-Z0-9\.\-\_\-]+(.png|.gif|.jpg|.jpeg)/g

let linkCopies = []

let match = messageContent.innerHTML.match(imgurRegex) || messageContent.innerHTML.match(discordRegex)
if (bhpSettings.m_ImageEmbeds) {
	if (match) {
		for (link in match) {
	
			// checks to see if the link has already been embedded
			if (linkCopies.includes(match[link])) continue
	
				// in case there are 2 of one link
			let imageRegExp = new RegExp(match[link], "g")
			let copyMatch = messageContent.innerHTML.match(imageRegExp)
	
			if (copyMatch.length === 1) {
				messageContent.innerHTML = messageContent.innerHTML.replace(imageRegExp, `<img src='${match[link]}'>`)
				continue
			}
	
			// if there are more than one of the same link, then embed every occurance and add the link to the linkCopies array
			messageContent.innerHTML = messageContent.innerHTML.replace(imageRegExp, `<img src='${match[link]}'>`)
			linkCopies.push(match[link])
			
		}
	}
}
