let url = window.location.href
let userId = url.match(/-?[0-9]+/)[0]
let api = "https://api.brick-hill.com/v1/games/retrieveAvatar?id="
let hatApi = "https://api.brick-hill.com/v1/shop/"

function generateHTML(item, itemData) {
    let mainLink = document.createElement("a")
    mainLink.href = `/shop/${item}`

    let profileCard = document.createElement("div")
    profileCard.className = "profile-card award"
    mainLink.appendChild(profileCard)

    let img = document.createElement("img")
    img.src = `${itemData.thumbnail}`
    profileCard.appendChild(img)

    let span = document.createElement("span")
    span.className = "ellipsis"
    span.innerText = itemData.name
    profileCard.appendChild(span)

    return mainLink
}

async function getItemData(id) {
    let data = await fetch(hatApi + id)
    return data.json()
}

async function appendItems(data) {

    let mainDiv = document.createElement("div")
    mainDiv.className = "top blue"
    mainDiv.innerText = "Wearing"

    let contentDiv = document.createElement("div")
    contentDiv.className = "content"
    contentDiv.style = "text-align:center;"



    //let s = `<div class="top blue">Wearing</div> <div class="content" style="text-align:center;">`
    // counting to see if the user is wearing anything at all
    let zeroCount = 0
    
    for (let hat of data.hats) {
        if (!hat) {
            ++zeroCount
            continue
        }

        let req = await getItemData(hat)
        let hatData = req.data

        contentDiv.appendChild( generateHTML(hat, hatData) )
        
    }

    for (let item of Object.values(data)) {
        if (isNaN(item)) continue
        if (!item) {
            ++zeroCount
            continue
        }
        
        let req = await getItemData(item)
        let itemData = req.data

        contentDiv.appendChild( generateHTML(item, itemData) )
    }

    console.log("hee")

    if (zeroCount === 12)
        return null

    return [ mainDiv, contentDiv ]
}

// checking for friends because it was weirdly messing up the formatting of the page
if (userId && !window.location.href.includes("friends")) {

    if (userId == 127118) {
        let username = document.getElementsByClassName("ellipsis")[3]
        username.innerHTML += "   <img src='https://images.emojiterra.com/twitter/512px/1f1e7-1f1e9.png' style='height:20px'>"
    }

    fetch(api + userId)
    .then(res => res.json())
    .then(data => {
        let mainDiv = document.getElementsByClassName("col-6-12")[1]
        let card = document.createElement("div")
        card.className = "card"

        // wait for the html then append it to the DOM
        appendItems(data.items).then(html => {
            if (html) {
                console.log("please be here")

                card.appendChild(html[0])
                card.appendChild(html[1])
                //card.innerHTML = DOMPurify.sanitize(html)

                mainDiv.appendChild(card)
            }
        })
    })
}

