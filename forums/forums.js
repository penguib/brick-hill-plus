let threads = document.getElementsByClassName("thread-row")
let replies = document.getElementsByClassName("p")

const userApi = "https://api.brick-hill.com/v1/user/profile?id="
const imgurRegex = /https:\/\/(i.)?imgur.com(\/a|\/gallery)?\/[0-9a-zA-Z]+(.png|.gif|.jpg|.jpeg)/g
const discordRegex = /https:\/\/cdn\.discordapp\.com\/attachments\/[0-9]+\/[0-9]+\/[a-zA-Z0-9\.\-\_\-]+(.png|.gif|.jpg|.jpeg)/g
const youtubeRegex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/g

const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))


async function getRawImage(link) {
    let data = await fetch(link, {
        method: "GET",
        mode: "cors"
    })
    return data
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
        let linkCopies = []
        let match = reply.innerHTML.match(imgurRegex) || reply.innerHTML.match(discordRegex)
        //let youtubeMatch = reply.innerHTML.match(youtubeRegex)

        if (match) {
            for (let link in match) {

                if (linkCopies.includes(match[link])) continue

                let imageRegExp = new RegExp(match[link], "g")
                let copyMatch = reply.innerHTML.match(imageRegExp)

                if (copyMatch.length === 1) {
                    reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<img src='${match[link]}'>`)
                    continue
                }

                console.log(`copy: ${match[link]}`)

                reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<img src='${match[link]}'>`)
                linkCopies.push(match[link])

            }


            // let img = document.createElement("img")
            // img.src = match[0]
            // reply.innerHTML = reply.innerHTML.replace(match[0], "")
            
            // reply.appendChild(img)
        }


        // get childNodes
        // filter out only youtube links 
            // Array.from(s.childNodes).filter(a => a.tagName === "A" && a.href.match(/((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/))
        // embed ig


    
        //let youtubeLink = Array.from(reply.childNodes

        // if (youtubeMatch) {
        //     console.log("shitting")

        //     for (let link in youtubeMatch) {

        //         if (linkCopies.includes(youtubeMatch[link])) continue

        //         console.log(youtubeMatch[link])

        //         let imageRegExp = new RegExp(youtubeMatch[link], "g")
        //         let copyMatch = reply.innerHTML.match(imageRegExp)

        //         if (copyMatch.length === 1) {
        //             reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<iframe src="${youtubeMatch[link][5]}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border:none" width="560" height="316" allowfullscreen="">`)
        //             continue
        //         }

        //         reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<iframe src="${youtubeMatch[link][5]}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border:none" width="560" height="316" allowfullscreen="">`)
        //         linkCopies.push(youtubeMatch[link])

        //     }

        //     // let youtubeVideo = document.createElement("iframe")
        //     // youtubeVideo.src = `https://www.youtube.com/embed/${youtubeMatch[5]}`
        //     // youtubeVideo.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        //     // youtubeVideo.allowfullscreen = ""
        //     // youtubeVideo.width = "560"
        //     // youtubeVideo.height = "316"
        //     // youtubeVideo.style = "border:none"
    
        //     // reply.appendChild(youtubeVideo)
        // }
    }
}
