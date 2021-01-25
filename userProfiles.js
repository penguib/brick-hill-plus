let url = window.location.href
let userId = url.match(/-?[0-9]+/)[0]
let api = "https://api.brick-hill.com/v1/games/retrieveAvatar?id="
let hatApi = "https://api.brick-hill.com/v1/shop/"

async function getItemData(id) {
    let data = await fetch(hatApi + id)
    return data.json()
}

async function appendItems(data) {
    let s = `<div class="top blue">Wearing</div> <div class="content" style="text-align:center;">`
    
    for (let hat of data.hats) {
        if (hat === 0) continue
        let req = await getItemData(hat)
        let hatData = req.data

        s += ` <a href="/shop/${hat}">
                    <div class="profile-card award">
                        <img src="${hatData.thumbnail}">
                        <span class="ellipsis">${hatData.name}</span>
                    </div>
                </a>
            `
    }

    for (let item of Object.values(data)) {
        if (item === 0 || isNaN(item)) continue
        let req = await getItemData(item)
        let itemData = req.data

        s += ` <a href="/shop/${item}">
                    <div class="profile-card award">
                        <img src="${itemData.thumbnail}">
                        <span class="ellipsis">${itemData.name}</span>
                    </div>
                </a>
            `
    }

    s += `</div>`
    return s
}

if (userId) {

    fetch(api + userId)
    .then(res => res.json())
    .then(data => {
        let mainDiv = document.getElementsByClassName("col-6-12")[1]
        let card = document.createElement("div")
        card.className = "card"

        // wait for the html then append it to the DOM
        appendItems(data.items).then(html => {
            card.innerHTML = html
            mainDiv.appendChild(card)
        })
    })
}

