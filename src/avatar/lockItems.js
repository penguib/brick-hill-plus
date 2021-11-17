function addLockBtt(child) {
    
    if (child.querySelector("button#locked") || child.querySelector("button#unlocked"))
        return
    
    const bhpSettings = storage.get("bhp-settings")
    const lockedItems = bhpSettings.a_Locked

    const takeOffBtt = child.querySelector("button.red")
    const itemID = Number(child.id.replace(/[^0-9\.]+/g, ""))

    const lockButton = document.createElement("button")
    lockButton.style.position = "absolute"
    lockButton.style.right = lockButton.style.top = "10px"
    lockButton.style.padding = "4px"
    lockButton.classList = "blue"

    const lockIcon = document.createElement("i")
    lockButton.appendChild(lockIcon)

    if (bhpSettings.a_Locked?.includes(itemID))  {
        lockIcon.classList = "fas fa-lock"
        lockButton.id = "locked"
        takeOffBtt.style.display = "none"
    } else {
        lockIcon.classList = "fas fa-lock-open"
        lockButton.id = "unlocked"
    }


    child.insertBefore(lockButton, child.childNodes[0].nextSibling)

    lockButton.addEventListener("click", () => {

        if (lockButton.id === "unlocked") {
            lockButton.id = "locked"
            lockIcon.classList = "fas fa-lock"

            takeOffBtt.style.display = "none"
            
            if (!lockedItems.includes(itemID))
                lockedItems.push(itemID)

            storage.addProp("bhp-settings", {
                a_Locked: lockedItems
            })
            
            return
        }
        lockButton.id = "unlocked"
        lockIcon.classList = "fas fa-lock-open"

        takeOffBtt.style.display = ""

        if (lockedItems.includes(itemID))
            lockedItems.splice(lockedItems.indexOf(itemID), 1)

        storage.addProp("bhp-settings", {
            a_Locked: lockedItems
        })
    })
}

let changed = false

$(document).ready(() => {

    const wearingContainer = document.querySelector("div.wearing-holder")
    wearingContainer.childNodes.forEach(c => {
        addLockBtt(c)
    })

    const observer = new MutationObserver((mutationsList, o) => {
        wearingContainer.childNodes.forEach(child => {
            addLockBtt(child)
        })
    })

    observer.observe(wearingContainer, {
        childList: true,
        subtree: true
    })
})

