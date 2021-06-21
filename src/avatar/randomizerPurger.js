// Thanks to Noah Cool Boy for providing this script

const token = document.querySelector("meta[name='csrf-token']").getAttribute("content")
const outfitCard = document.querySelector(".outfit-card .content")
const lockedItems = JSON.parse(document.querySelector("meta[name='locked-items']").getAttribute("content"))
const loadingMessages = [
    "Shuffling the stuff", 
    "Doing things", 
    "Randomizing the avatar", 
    "Making your new outfit", 
    "Tiny computer is thinking", 
    "Generating a combo", 
    "The machine is hard at work"
]
const bodyParts = [
    "Torso", 
    "Left Arm", 
    "Right Arm", 
    "Left Leg", 
    "Right Leg", 
    "Head"
]
const buttons = document.createElement("div")

buttons.style.display = "flex"
buttons.style.marginTop = "5px"
buttons.innerHTML = `<button class="blue" style="width: 100%; margin-right: 5px" onclick="rand()">Randomize</button>
                     <button class="red" style="width: 100%; margin-left: 5px" onclick="purge()">Purge</button>`
outfitCard.appendChild(buttons)
 
document.purge = async function() {
    let modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `<div class="modal-content">
                            <span class="close">x</span>
                            Purge Avatar
                            <hr>
                            Are you sure you would like to purge your avatar?
                            <div class="modal-buttons">
                                <button class="green">Yes</button>
                            </div>
                        </div>`

    modal.querySelector(".close").addEventListener("click", () => {
        modal.remove()
    })
    modal.querySelector("button").addEventListener("click", () => {

        modal.remove()

        const http = new XMLHttpRequest()
        http.open("GET", "/api/avatar/wearing", false)
        http.withCredentials = true
        http.send()

        const wearing = JSON.parse(http.responseText)
        wearing.forEach((clothing, i) => {
            if (lockedItems.includes(clothing.id))
                return
            setTimeout(()=>{
                avatarUpdate("remove", clothing.id)
            }, i * 1500)
        })
    })
    outfitCard.appendChild(modal)
}
 
let types = {}
document.querySelectorAll(".item-types a").forEach(v => {
    if (v.innerText == "Outfits") return
    types[v.getAttribute("data-url")] = v.innerText
})
 
document.rand = function() {
    let modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `<div class="modal-content">
                            <span class="close">x</span>
                            Random Outfit Generator
                            <hr>
                            What would you like to randomize?
                            <br>
                            ${Object.values(types).map(v=>`<div class="option"><input type="checkbox" checked>${v}<br></div>`).join("")}
                            <div class="colors">
                                <input type="checkbox">Body Colors
                                <br>
                            </div>
                            <div class="modal-buttons">
                                <button class="green">Randomize!</button>
                            </div>
                       </div>`

    modal.querySelector(".close").addEventListener("click", () => {
        modal.remove()
    })
    modal.querySelector("button").addEventListener("click", () => {
        randomize(modal)
    })
    outfitCard.appendChild(modal)
}
 
function wait(ms) {
    return new Promise(a => {
        setTimeout(a, ms)
    })
}
 
function randomize(modal) {
    modal.querySelector(".close").remove()
    modal.querySelector("button").remove()

    let status = document.createElement("span")
    modal.querySelector(".modal-content").appendChild(status)

    let opts = [...modal.querySelectorAll(".option")].map(v => v.innerText.trim())
    setTimeout(async () => {
        let inventory = {}
        if (window.localStorage.randomizer_cache && window.localStorage.randomizer_cache_date && Date.now() - window.localStorage.randomizer_cache_date < 1000 * 60 * 60 * 24)

            inventory = JSON.parse(window.localStorage.randomizer_cache)

        else {

            for (let opt of opts) {

                inventory[type] = []
                let apiType = Object.keys(types).find(key => types[key] == opt)
                let page = 1

                while (true) {

                    const req = new XMLHttpRequest()
                    req.open("GET","/api/avatar/crate/" + apiType + "/" + page, false)
                    req.withCredentials = true
                    req.send()

                    const json = JSON.parse(req.responseText)
                    inventory[opt] = inventory[opt].concat(json.data.map(v => v.item_id))

                    if (data.pages.current >= data.pages.pageCount)
                        break

                    ++page

                    await wait(5)
                    status.innerText = `Getting ${opt} ${data.pages.current}/${data.pages.pageCount}`
                }
            }
 
            window.localStorage.randomizer_cache = JSON.stringify(inventory)
            window.localStorage.randomizer_cache_date = Date.now()
        }
        opts = [...modal.querySelectorAll(".option")].map(v => [ v.innerText.trim(), v.querySelector("input").checked ])
        opts = opts.filter(v => v[1]).map(v => v[0])
        Object.keys(inventory).filter(v => !opts.includes(v)).forEach(v => delete inventory[v])

        if (inventory.Hats)
            inventory.Hats3 = inventory.Hats2 = inventory.Hats

        status.innerText = loadingMessages [Math.floor( Math.random() * loadingMessages.length ) ]

        let outfit = Object.values(inventory).filter(v => v.length).map(v => v[ Math.floor(Math.random() * v.length) ])
        for (let o of outfit) {
            avatarUpdate("wear", o)
            await wait(1000)
        }

        const bodyColors = modal.querySelector(".colors > input")
        if (bodyColors.checked) {

            for (let i = 0, len = bodyParts.length; i < len; ++i) {

                const randColor = Array(6).fill(0).map(v => "0123456789ABCDEF"[ Math.floor(Math.random() * 16) ]).join("")
                const req = new XMLHttpRequest()


                req.open("POST", "/api/avatar/process", false)
                req.withCredentials = true
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

                req.send(`_token=${token}&type=color&part=${ bodyParts[i] }&color=${ randColor }`)

                const parts = [...document.querySelectorAll(".part-btn")]
                parts.find(v => v.onclick.toString().includes(bodyParts[i])).style.backgroundColor = "#" + randColor

                await wait(5)
            }

            // I didn't find any way to force reload the avatar preview
            window.location.reload() 

        } else 
            modal.remove()
    }, 1)
}