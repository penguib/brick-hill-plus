const url = window.location.href
const userId = url.match(/-?[0-9]+/)[0]
const api = "https://api.brick-hill.com/v1/games/retrieveAvatar?id="
const hatApi = "https://api.brick-hill.com/v1/shop/"
const userApi = "https://api.brick-hub.com/v1/user/"

// Creatubg each element with creatElement to prevent XSS
// Thanks to Dragonian 
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

    // Counting to see if the user is wearing anything at all
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

    if (zeroCount === 12)
        return null

    return [ mainDiv, contentDiv ]
}

async function getUserData() {
    let res = await fetch(userApi + userId)
    return res.json()
}

async function generateUserInfo() {
    const mainDiv = document.createElement("div")
    mainDiv.className = "card"

    const topDiv = document.createElement("div")
    topDiv.className = "top red"
    topDiv.innerText = "User Info"
    mainDiv.appendChild(topDiv)

    const contentDiv = document.createElement("div")
    contentDiv.className = "content"
    contentDiv.style = "text-align: center"
    mainDiv.appendChild(contentDiv)

    const container = document.createElement("div")
    container.style = "display: flex; flex-wrap: wrap; justify-content: center; gap: 10px"
    contentDiv.appendChild(container)

    const userData = await getUserData()
    
    if (userData.err) {
        const sErr = document.createElement("span")
        sErr.innerText = "User is not in Brick Hill Value's database"
        contentDiv.appendChild(sErr)

        for (let i = 0; i < 2; i++) {
            contentDiv.appendChild(document.createElement("br"))
        }

        const aCAdd = document.createElement("a")
        aCAdd.style = "color: cornflowerblue"
        aCAdd.innerText = "Click here "
        aCAdd.href = "https://trade.brick-hub.com/user/" + userId
        contentDiv.appendChild(aCAdd)

        const aAdd = document.createElement("a")
        aAdd.innerText = "to add them!"
        aCAdd.href = "https://trade.brick-hub.com/user/" + userId
        contentDiv.appendChild(aAdd)

    } else {
        const dValue = document.createElement("button")
        dValue.className = "button green flat no-cap"
        dValue.innerHTML = `Value: <span class="bucks-icon img-white"></span> ${userData.value.toLocaleString()}`
        container.appendChild(dValue)
    
        const dAverage = document.createElement("button")
        dAverage.className = "button orange flat no-cap"
        dAverage.innerHTML = `Averrage: <span class="bucks-icon img-white"></span> ${userData.average.toLocaleString()}`
        container.appendChild(dAverage)
    
        const dRank = document.createElement("button")
        dRank.className = "button blue flat no-cap"
        dRank.innerText = `Rank: #${userData.rank.toLocaleString()}`
        container.appendChild(dRank)
    
        const dSpecials = document.createElement("button")
        dSpecials.className = "button red flat no-cap"
        dSpecials.innerText = `Specials: ${userData.items.specials.toLocaleString()}`
        container.appendChild(dSpecials)
    
        const dHoards = document.createElement("button")
        dHoards.className = "button blue flat no-cap"
        dHoards.innerText = `Hoards: ${userData.items.hoards.toLocaleString()}`
        container.appendChild(dHoards)
    
        for (let i = 0; i < 2; i++) {
            contentDiv.appendChild(document.createElement("br"))
        }
    
        const aDetails = document.createElement("a")
        aDetails.href = "https://trade.brick-hub.com/user/" + userId
        aDetails.innerText = "View more with "
        contentDiv.appendChild(aDetails)
    
        const aBHV = document.createElement("a")
        aBHV.href = "https://trade.brick-hub.com/user/" + userId
        aBHV.style = "color: cornflowerblue"
        aBHV.innerText = "Brick Hill Values"
        contentDiv.appendChild(aBHV)
    }

    return mainDiv
}
const userContainer = document.querySelector("div.content.text-center.bold.medium-text.relative.ellipsis")
$(userContainer).css("outline", "none")
const view3D = document.createElement("button")

view3D.classList = "button medium green f-right"
$(view3D).css({
    "position": "relative",
})
view3D.innerText = "3D"

const userDescription = document.querySelector("div.user-description-box")

userContainer.insertBefore(view3D, userDescription)
userContainer.insertBefore(document.createElement("br"), view3D)

for (let i = 0; i < 2; ++i)
    userContainer.insertBefore(document.createElement("br"), userDescription)

// Checking for friends because it was weirdly messing up the formatting of the page
if (userId && !window.location.href.includes("friends")) {

    if (userId == 127118) {
        let username = document.getElementsByClassName("ellipsis")[3]
        username.innerHTML += "   <img src='https://images.emojiterra.com/twitter/512px/1f1e7-1f1e9.png' style='height:20px'>"
    }

    fetch(api + userId)
    .then(res => res.json())
    .then(data => {
        let mainDiv = document.getElementsByClassName("col-6-12")
        var second_div = mainDiv[0].getElementsByClassName('card')[0]
        let card = document.createElement("div")
        card.className = "card"

        generateUserInfo().then(div => {
            mainDiv[0].insertBefore(div, second_div.nextSibling)
        })

        // Wait for the HTML then append the clothing to the DOM
        appendItems(data.items).then(html => {
            if (html) {
                card.appendChild(html[0])
                card.appendChild(html[1])

                mainDiv[1].appendChild(card)
            }
        })
    })
}

$(document).ready(async () => {
    const dropDown = $("div[class='dropdown-content']")[0]
    const ul = $(dropDown).find('ul')[0]
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.innerText = "Copy Avatar URL"
    li.appendChild(a)

    const imgs = $(userContainer).find('img')
    const userThumbnail = imgs.toArray().find(i => i.src.includes("brkcdn"))

    const loadingContainer = document.createElement('div')
    $(loadingContainer).css("height", "327px")
    $(loadingContainer).hide()
    const loadingGif = document.createElement('div')
    loadingGif.classList = "loader"
    loadingContainer.appendChild(loadingGif)

    userContainer.insertBefore(loadingContainer, userThumbnail)

    $(li).click(() => {
        navigator.clipboard.writeText(userThumbnail.src)
        setTimeout(() => {
            $(li).css("color", "")
            $(a).text("Copy Avatar Img")
        }, 2000)
        $(li).css("color", "lightgreen")
        $(a).text("Copied ✓")
    })

    if (!ul?.children[0])
        ul.appendChild(li)
    else
        ul.insertBefore(li, ul.children[0])

    let loaded3D = false
    $(view3D).click(async () => {
        const btt  = $(view3D)
        const text = btt.text()
        const cameraPosition = new THREE.Vector3(-2.9850597402271473, 5.024487076222519, 4.542919202987628)

        if (text.includes("3D")) {

            if (!loaded3D) {
                $(userThumbnail).hide()
                $(loadingContainer).show()
                loaded3D = await renderUser(userId, userContainer)
                $(loadingContainer).hide()

                const canvas = loaded3D.renderer
                const camera = loaded3D.camera

                canvas.setSize( 325, 327 );
                $(canvas.domElement).css({
                    "margin-right": "auto",
                    "margin-left": "auto"
                })

                userContainer.insertBefore(canvas.domElement, $(userThumbnail).next()[0])
                camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)

            } else {
                loaded3D.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
                $(loaded3D.renderer.domElement).show()
            }

            btt.text("2D")
            btt.removeClass("green")
            btt.addClass("blue")

            $(userThumbnail).hide()

            return
        }


        $(loaded3D.renderer.domElement).hide()

        btt.text("3D")
        btt.removeClass("blue")
        btt.addClass("green")

        $(userThumbnail).show()

        return
    })

    if (document.querySelectorAll(".stats-table")) {

        let date = document.getElementById("join-date").innerText.match(/(\d+)\/(\d+)\/(\d+)/)
        date = new Date(`${date[3]} ${date[2]} ${date[1]}`)

        const days = Math.floor((new Date() - date) / 1000 / 60 / 60 / 24)
        const posts = parseInt(document.getElementById("forum-posts").innerText.match(/[\d,]+/)[0].replace(/,/g,""))
        const text = document.createElement("td")

        text.innerText = (posts / days).toFixed(1) + " posts per day"
        const tr = document.createElement("tr")
        tr.innerHTML = "<td><b>Posts per day:</b></td>"
        tr.appendChild(text)
        
        document.querySelectorAll(".stats-table")[0].appendChild(tr)
    }

})