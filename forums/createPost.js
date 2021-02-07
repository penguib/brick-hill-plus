const forumBody = document.getElementById("body")
const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))
const lineBreaks = 6
const imgurRegex = /https:\/\/(i.)?imgur.com(\/a|\/gallery)?\/[0-9a-zA-Z]+(.png|.gif|.jpg|.jpeg)/gi
const discordRegex = /https:\/\/cdn\.discordapp\.com\/(attachments|emojis)\/[0-9]+(\/[0-9]+\/)?[a-zA-Z0-9\.\-\_\-]+(.png|.gif|.jpg|.jpeg)(\?v=1)?/gi
const youtubeRegex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/

// lmao is this how i do this?
if (bhpSettings.forumSignature) {
    forumBody.innerHTML = "\n".repeat(lineBreaks) + bhpSettings.forumSignature.substring(0, 100)
}

let replies = document.querySelectorAll("blockquote.red")

for (let reply of replies) {
    let linkCopies = []
    let match = reply.innerHTML.match(imgurRegex) || reply.innerHTML.match(discordRegex)
    let adminImages = Array.from(reply.childNodes).filter(img => img.tagName === "IMG" && ( img.src.match(imgurRegex) || img.src.match(discordRegex) ))

    // I'm literally just hoping no admin causes this bug since I can't think of a way to fix it right now
    // The bug is that if an admin embeds an image using the ![]() format and just posting their link to let BH+ embed it, only the one link formatted with ![]() will embed
    // Other than that, they can do both with just different links

    if (match) {
        for (let link in match) {

            // checks to see if the link has already been embedded
            if (linkCopies.includes(match[link])) continue
            if (adminImages.find(img => img.src === match[link])) continue
            
            // in case there are 2 of one link
            // using replace here so that the regex converts the question mark to \? instead of leaving it as just ?
            // leaving it as just ? messed up matching with discord emoji links
            let imageRegExp = new RegExp(match[link].replace("?", "\\?"), "g")
            let copyMatch = reply.innerHTML.match(imageRegExp)

            if (copyMatch.length === 1) {
                reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<img src='${match[link]}' style='max-height:500px;max-width:500px;'>`)
                continue
            }

            // if there are more than one of the same link, then embed every occurance and add the link to the linkCopies array
            reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<img src='${match[link]}' style='max-height:500px;max-width:500px;'>`)
            linkCopies.push(match[link])

        }
    }
}