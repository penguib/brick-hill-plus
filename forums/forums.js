let threads = document.getElementsByClassName("thread-row")
let replies = document.getElementsByClassName("p")

const userApi = "https://api.brick-hill.com/v1/user/profile?id="
const imgurRegex = /https:\/\/(i.)?imgur.com(\/a|\/gallery)?\/[0-9a-zA-Z]+(.png|.gif|.jpg|.jpeg)/
const discordRegex = /https:\/\/cdn\.discordapp\.com\/attachments\/[0-9]+\/[0-9]+\/[a-zA-Z0-9]+(.png|.gif|.jpg|.jpeg)/

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

for (let reply of replies) {
    let match = reply.innerText.match(imgurRegex) || reply.innerText.match(discordRegex)
    if (!match) continue

    // if (match[0].includes("/gallery/") || match[0].includes("/a/")) {
    //     let data = getRawImage(match[0]).then(data => console.log(data))
    // }

    let img = document.createElement("img")
    img.src = match[0]
    reply.innerText = reply.innerText.replace(match[0], "")
    
    reply.appendChild(img)
}
