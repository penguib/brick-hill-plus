async function getConfig() {
    const url = browser.runtime.getURL("src/rendering/config.json")
    const res = await fetch(url)
    return await res.json()
}