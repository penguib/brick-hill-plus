const threads = document.getElementsByClassName("thread-row")
const replies = document.getElementsByClassName("p")
const userApi = "https://api.brick-hill.com/v1/user/profile?id="
const imgurRegex = /https:\/\/(i.)?imgur.com(\/a|\/gallery)?\/[0-9a-zA-Z]+(.png|.gif|.jpg|.jpeg)/gi
const discordRegex = /https:\/\/(cdn|media)\.discordapp\.(com|net)\/(attachments|emojis)\/[0-9]+(\/[0-9]+\/)?[a-zA-Z0-9\.\-\_\-]+(.png|.gif|.jpg|.jpeg)(\?v=1)?/gi
const youtubeRegex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))
const maxPxSize = 600

const codeRegex = /---js((.|[\n\r])+)[\n|\r]---/i

const allowedEmbedDomains = [
    "media.discordapp",
    "cdn.discordapp",
    "youtube.com",
    "youtu.be",
    "imgur.com",
    "tenor.com"
]
const embedFormatRegExp = /\!\(((https?:\/\/[a-zA-Z0-9\.]+)(.+))\)/i
const safeLinkRegExp = /\!\(<a target="_blank" href="(.+)\)">(.+)\)<\/a>/i


function generateImageSrc(src) {
    if (src.includes("tenor.com") && !src.endsWith(".gif"))
        return src + ".gif"
    return src
}

function getYoutubeID(link) {
    let match = link.match(youtubeRegex)
    if (!match) return null

    return "https://www.youtube.com/embed/" + ((match[5] === "watch") ? match[6].match(/\?t=[0-9]+\&v=([a-zA-Z0-9]+)&feature=youtu.be/)[1] : match[5]).toUpperCase()
}


for (let reply of replies) {
    let codeMatch = reply.innerHTML.match(codeRegex)
    if (codeMatch) {
        let script = document.createElement("script")
        script.onload = () => {}
        script.src = "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"
        script.type='text/javascript'
        reply.appendChild(script)

        let pre = document.createElement("pre")
        pre.classList = "prettyprint lang-js s-code-block hljs javascript linenums prettyprinted"

        let code = document.createElement("code")
        code.innerHTML = codeMatch[1]
        pre.appendChild(code)
        reply.appendChild(pre)
    }
}

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

        // Make the RegExps global
        let match   = reply.innerHTML.match( new RegExp(embedFormatRegExp, "gi") )
        let sfMatch = reply.innerHTML.match( new RegExp(safeLinkRegExp, "gi") )
        if (!match && !sfMatch) continue

        const domainRegExp = new RegExp(allowedEmbedDomains.join("|"))


        for (let link in match) {

            // [0] = !(https://youtube.com/watch?v=xxxxxxxxx)
            // [1] = https://youtube.com/watch?v=xxxxxxxxx
            // [2] = https://youtube.com
            match[link] = match[link].toLowerCase()
            const formatMatch = match[link].match(embedFormatRegExp)

            if (!domainRegExp.test(formatMatch[2])) continue
            
            let textElement = Array.from( reply.childNodes ).find(el => {
                if (!el.data) return
                return el.data.toLowerCase().includes(formatMatch[0])
            })

            let img = document.createElement("img")
            img.style = `max-height:${maxPxSize}px; max-width:100%;`
            img.src = generateImageSrc(formatMatch[1])

            // Replace the image with the formatted link
            reply.insertBefore(img, textElement)
            textElement.remove()

        }

        for (let link in sfMatch) {
            // [0] = !(<a target=\"_blank\" href=\"https://www.youtube.com/watch?v=xxxxxx)\">https://www.youtube.com/watch?v=xxxxxx)</a>
            // [1] = https://youtube.com/watch?v=xxxxxxxxx
            sfMatch[link] = sfMatch[link].toLowerCase()
            const formatMatch = sfMatch[link].match(safeLinkRegExp)

            if (!domainRegExp.test(formatMatch[1])) continue

            let textElement = Array.from( reply.childNodes ).find(el => {
                if (!el.href) return
                return el.href.toLowerCase().includes(formatMatch[1])
            })


            const iframe = document.createElement("iframe")
            iframe.src = getYoutubeID(formatMatch[1])
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            iframe.allowfullscreen = ""
            iframe.width = "560"
            iframe.height = "316"
            iframe.style = "border:none"

            // Replace the image with the formatted link
            reply.insertBefore(iframe, textElement)
            textElement.remove()

            // We need this because the safe links would mess up my format and just leave a "!(" before the iframe
            Array.from( reply.childNodes ).find(el => {
                if (!el.data) return
                return el.data.endsWith("!(")
            }).remove()
        }
    }
}
