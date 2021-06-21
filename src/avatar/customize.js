var browser = browser || chrome
const bhpSettings = storage.get("bhp-settings")

;(async () => {
    const url = browser.runtime.getURL("src/avatar/randomizerPurger.js")
    $('head').append(`<meta name="locked-items" content=${JSON.stringify(bhpSettings.a_Locked)}>`)
    $('head').append(`<script src="${url}"></script`)
})()
