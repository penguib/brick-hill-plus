const bhpSettings = storage.get("bhp-settings")
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*/
const banners = document.querySelectorAll("div.alert")

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

if (banners.length) {
    banners.forEach(banner => {
        const html = banner.innerHTML
        const urlMatch = html.match(urlRegex)
        if (urlMatch) {
            // trusting that the banner links will never lead to XSS
            const link = `<a href="${urlMatch[0]}" target="_blank">${urlMatch[0]}</a>`
            banner.innerHTML = banner.innerHTML.replace(urlMatch[0], link)
        }
    })
}