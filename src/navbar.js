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
                                                       </li>`;

if (bhpSettings.n_ColoredIcons) {
    const info = document.querySelector(".info")
    const children = info.children

    for (let element of children) {
        const icon = element.querySelector("span")
        if (icon.classList.contains("img-white")) {
            icon.classList.remove("img-white")
        }
    }
}