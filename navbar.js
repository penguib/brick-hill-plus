if (!window.localStorage.getItem("bhp-settings")) {
	window.localStorage.setItem("bhp-settings", JSON.stringify({
		forumImageEmbeds:  true,
        forumBadges: true,
        forumSignature: "",
        messagesImageEmbeds: true,
        shopConversions: 0.099, // 100 bucks - $0.99
        shopComments: true
	}))
}

let mainDiv = document.getElementsByClassName("bottom-bar")
mainDiv[0].childNodes[0].nextSibling.innerHTML += "<li><a href='https://discord.gg/wWsGUfZw4Z'>Discord</a></li>"