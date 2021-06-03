if (!storage.checkProps("bhp-settings"))
    storage.fillProps("bhp-settings")

console.log(storage.get("bhp-settings"));

let mainDiv = document.getElementsByClassName("bottom-bar")
mainDiv[0].childNodes[0].nextSibling.innerHTML += "<li><a href='https://discord.gg/wWsGUfZw4Z'>Discord</a></li>"
