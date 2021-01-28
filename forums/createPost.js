const forumBody = document.getElementById("body")
const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))

// lmao is this how i do this?
forumBody.innerHTML = `




${bhpSettings.forumSignature.substring(0, 100)}`