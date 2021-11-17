const bhpSettings = storage.get("bhp-settings")

if (!storage.checkProps("bhp-settings"))
    storage.fillProps("bhp-settings")

const customButton = bhpSettings.n_CustomButton
if (customButton.name && customButton.link) {

    const navbar = $("div.primary > div.grid > div.push-left > ul")
    const li = document.createElement("li")
    const a = document.createElement("a")

    a.href = customButton.link
    a.innerText = customButton.name

    li.appendChild(a)

    navbar[0].appendChild(li)
}

console.log(storage.get("bhp-settings"));
let mainDiv = document.getElementsByClassName("bottom-bar")

// If the user is logged in
if (mainDiv[0])
    mainDiv[0].childNodes[0].nextSibling.innerHTML += "<li><a href='https://discord.gg/brick-hill'>Discord</a></li>"
