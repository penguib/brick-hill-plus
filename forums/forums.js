const threads = document.getElementsByClassName("thread-row")
const replies = document.getElementsByClassName("p")
const userApi = "https://api.brick-hill.com/v1/user/profile?id="
const imgurRegex = /https:\/\/(i.)?imgur.com(\/a|\/gallery)?\/[0-9a-zA-Z]+(.png|.gif|.jpg|.jpeg)/g
const discordRegex = /https:\/\/cdn\.discordapp\.com\/(attachments|emojis)\/[0-9]+(\/[0-9]+\/)?[a-zA-Z0-9\.\-\_\-]+(.png|.gif|.jpg|.jpeg)(\?v=1)?/g
const youtubeRegex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))

if (bhpSettings.forumBadges) {
    for (let thread of threads) {
        let innerHTML = thread.childNodes[1].innerHTML
        let match = innerHTML.match(/\/user\/(-?[0-9]+)/)[1]
        let mainDiv = thread.childNodes[1].childNodes[1]
        fetch(userApi + match)
        .then(res => res.json())
        .then(data => {
            let awards = data.awards
            let isAdmin = awards.find(award => award.award_id === 3)

            // add a break for non-admins so that the awards are under their post count
            let s = (isAdmin) ? "" : "<br>"

            for (let award of awards) {
                s += `<img src="https://www.brick-hill.com/images/awards/${award.award_id}.png" style="width:40px">`
            }
            mainDiv.innerHTML += s
        })
    }
}

if (bhpSettings.forumImageEmbeds) {
    for (let reply of replies) {
        let linkCopies = []
        let match = reply.innerHTML.match(imgurRegex) || reply.innerHTML.match(discordRegex)

        if (match) {
            for (let link in match) {

                // checks to see if the link has already been embedded
                if (linkCopies.includes(match[link])) continue

                // in case there are 2 of one link
                // using replace here so that the regex converts the question mark to \? instead of leaving it as just ?
                // leaving it as just ? messed up matching with discord emoji links
                let imageRegExp = new RegExp(match[link].replace("?", "\\?"), "g")
                let copyMatch = reply.innerHTML.match(imageRegExp)

                console.log(copyMatch)

                if (copyMatch.length === 1) {
                    reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<img src='${match[link]}'>`)
                    continue
                }

                // if there are more than one of the same link, then embed every occurance and add the link to the linkCopies array
                reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<img src='${match[link]}'>`)
                linkCopies.push(match[link])

            }
        }


        // looking for the "a" tag in the reply since youtube links are embedded into links on the forums
        // Then I check if the "a" tag's href is also a youtube link
        let youtubeLinks = Array.from(reply.childNodes).filter(a => a.tagName === "A" && a.href.match(youtubeRegex))
        if (!youtubeLinks.length) continue

        for (let link of youtubeLinks) {
            let match = link.href.match(youtubeRegex)

            let youtubeVideo = document.createElement("iframe")
            youtubeVideo.src = `https://www.youtube.com/embed/${match[5]}`
            youtubeVideo.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            youtubeVideo.allowfullscreen = ""
            youtubeVideo.width = "560"
            youtubeVideo.height = "316"
            youtubeVideo.style = "border:none"
    
            // insert the video after the link then remove the link right after
            reply.insertBefore(youtubeVideo, link.nextSibling)
            link.remove()
        }
    }
}
