const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*/
const banners = document.querySelectorAll("div.alert")

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

let mainDiv = document.getElementsByClassName("bottom-bar")

// If the user is logged in because there isn't a bottom navbar if they aren't
if (mainDiv[0])
    mainDiv[0].childNodes[0].nextSibling.innerHTML += `<li>
                                                        <a href='https://www.brick-hill.com/promocodes'>Promocodes</a>
                                                       </li>
                                                       <li>
                                                        <a href='https://discord.gg/brick-hill'>Discord</a>
                                                       </li>`

if (banners.length) {
    banners.forEach(banner => {
        const html = banner.innerText
        const urlMatch = html.match(urlRegex)
        if (urlMatch) {
            // trusting that the banner links will never lead to XSS
            const link = `<a href="${urlMatch[0]}" target="_blank">${urlMatch[0]}</a>`
            banner.innerHTML = banner.innerHTML.replace(urlMatch[0], link)
        }
    })
}