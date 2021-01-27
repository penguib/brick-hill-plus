let threads = document.getElementsByClassName("thread-row")
let replies = document.getElementsByClassName("p")

const userApi = "https://api.brick-hill.com/v1/user/profile?id="
const imgurRegex = /https:\/\/(i.)?imgur.com(\/a|\/gallery)?\/[0-9a-zA-Z]+(.png|.gif|.jpg|.jpeg)/
const discordRegex = /https:\/\/cdn\.discordapp\.com\/attachments\/[0-9]+\/[0-9]+\/[a-zA-Z0-9\.\-\_\-]+(.png|.gif|.jpg|.jpeg)/
const youtubeRegex = /http(s)?:\/\/www\.youtube\.com\/watch\?v=([^\\\. <>]+)/

async function getRawImage(link) {
    let data = await fetch(link, {
        method: "GET",
        mode: "cors"
    })
    return data
}

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

// looking for images
for (let reply of replies) {
    let match = reply.innerText.match(imgurRegex) || reply.innerText.match(discordRegex)
    let youtubeMatch = reply.innerHTML.match(youtubeRegex)
    console.log(youtubeMatch)
    if (match) {
        let img = document.createElement("img")
        img.src = match[0]
        reply.innerHTML = reply.innerHTML.replace(match[0], "")
        
        reply.appendChild(img)
    }

    if (youtubeMatch) {
        let youtubeVideo = document.createElement("iframe")
        youtubeVideo.src = `https://www.youtube.com/embed/${youtubeMatch[5]}`
        youtubeVideo.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        youtubeVideo.allowfullscreen = ""
        youtubeVideo.width = "560"
        youtubeVideo.height = "316"
        youtubeVideo.style = "border:none"

        reply.appendChild(youtubeVideo)
    }

}


// <iframe width="556" height="312" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


