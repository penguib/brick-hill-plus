// This script is to run on every page before any other content script
const bhpSettings = storage.get("bhp-settings")

if (!storage.checkProps("bhp-settings"))
    storage.fillProps("bhp-settings")
