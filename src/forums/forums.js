const threads = document.getElementsByClassName("thread-row")
const replies = document.getElementsByClassName("p")
const userApi = "https://api.brick-hill.com/v1/user/profile?id="
const youtubeRegex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
const maxPxSize = 600

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

    return "https://www.youtube.com/embed/" + ((match[5] === "watch") ? match[6].match(/\?t=[0-9]+\&v=([a-zA-Z0-9]+)&feature=youtu.be/)[1] : match[5])
}

if (bhpSettings.f_Badges) {
    for (let thread of threads) {
        let innerHTML = thread.childNodes[1].innerHTML
        let match = innerHTML.match(/\/user\/(-?[0-9]+)/)[1]
        let mainDiv = thread.childNodes[1].childNodes[1]

        fetch(userApi + match)
        .then(res => res.json())
        .then(async data => {
            let awards = data.awards
            let isAdmin = awards.find(award => award.award_id === 3)

            // Add a break for non-admins so that the awards are under their post count
            let html = (bhpSettings.f_PPD) ? "" : "<br>"
            if (isAdmin) 
                html = ""

            for (let award of awards)
                html += `<img src="https://www.brick-hill.com/images/awards/${award.award_id}.png" style="width:40px">`

            mainDiv.innerHTML += html
        })
    }
}

async function gconfig() {
    var browser = browser || chrome
    const configURL = browser.runtime.getURL("src/settings.json")
    const res = await fetch(configURL)
    const json = await res.json()
    return json
}

if (bhpSettings.f_ImageEmbeds) {
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
            const formatMatch = match[link].match(embedFormatRegExp)

            if (!domainRegExp.test(formatMatch[2])) continue
            
            let textElement = Array.from( reply.childNodes ).find(el => {
                if (!el.data) return
                return el.data.includes(formatMatch[0])
                //.toLowerCase().
            })

            if (!textElement)
                continue

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

if (bhpSettings.f_PPD) {
    const container = document.querySelectorAll("span.light-gray-text")
    for (let i = 0, len = container.length; i < len; i += 2) {
    
        // Finding the users' join date to calculate total days
        const isStaff = container[i].parentNode.querySelectorAll("div[style='color:#0f0fa2;'], div.red-text").length
        let date = container[i].innerText.match(/(\d+)\/(\d+)\/(\d+)/)
        date = new Date(`${date[3]} ${date[2]} ${date[1]}`)
    
        const days = Math.floor((new Date() - date) / 1000 / 60 / 60 / 24)
        const posts = parseInt( container[ i + 1 ].innerText.match(/[\d,]+/)[0].replace(/,/g,"") )
        const text = document.createElement("span")
    
        text.className = "light-gray-text bhp-ppd"
        text.innerText = (posts/days).toFixed(1) + " posts per day"

        const col = document.querySelectorAll(".col-3-12")
        const curColumn = col[i / 2]
    
        if (!isStaff)
            curColumn.appendChild(document.createElement("br"))
        curColumn.appendChild(text)

        curColumn.insertBefore(document.createElement("br"), curColumn.querySelector("span.bhp-ppd").nextSibling)
    }
}