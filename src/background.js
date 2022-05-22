var browser = browser || chrome;

const notifierConstants = {
    specials:     1 << 0,
    newItems:     1 << 1,
    updatedItems: 1 << 2,
    tweets:       1 << 3,
    firstItem:    1 << 4,
};

// 0x1F is the default (all settings on)
let defaultSettings = 0x1F;
let notifierSettings = defaultSettings;

browser.storage.onChanged.addListener((changes, _) => {
    if (Object.keys(changes).length === 0) {
        notifierSettings = defaultSettings
    }
    notifierSettings = changes.settings.newValue
});

(function connect() {
    try {
        let socket = new WebSocket('ws://ws.brick-hill.plus/');
        //let socket = new WebSocket('ws://localhost:8001/');
    
        socket.onopen = () => {
            console.log("Connected to WebSocket!");
            
            // Ping function to not get disconnected
            setInterval(() => {
                socket.send(1)
            }, 60 * 1000)
        };

        socket.onmessage = event => {
            try {
                const packet = JSON.parse(event.data)
                console.log(packet)
                const message = packet.Message

                switch (packet.MessageType) {
                    // Item notifier
                    case 0: {
                        newItem(message)
                        break
                    }
                    // Notification from BH+
                    case 1: {
                        announcement(message)
                        break
                    }
                    // Tweet from the Brick Hill account
                    case 2: {
                        if (notifierConstants.tweets & notifierSettings)
                            newTweet(message)
                        break
                    }
                    default:
                        break
                }
            } catch(err) {
                console.warn("Missed packet from server")
                console.error(err)
            }
        };
    
        socket.onclose = event => {
            console.log("Reconnecting in 1 second... ")
            console.log(event)
            setTimeout(() => {
                connect()
            }, 1000);
        }

        socket.onerror = event => {
            console.error(event)
        }
    } catch {
        console.warn("Couldn't connect to WebSocket")
    }
})()

function newItem(packet) {
    let title = getItemTitle(packet)

    // Getting a null title results in one of their
    // notifier settings being off
    if (!title)
        return

    // We need Date.now() in the notification ID since Chrome doesn't send
    // duplicate notifications
    //
    // Notification ID format:
    // (Notification type)-(item ID)-(Current date)
    browser.notifications.create(`0-${packet.id}-${Date.now()}`, {
        "type": "basic",
        "iconUrl": `${packet.thumbnail}`,
        "title": title,
        "message": `${packet.name}`
    });
}

function getItemTitle(packet) {

    switch (packet.ItemStatus) {
        // New item
        case 0: {
            if (notifierConstants.newItems & notifierSettings)
                return "New item"
            return null
        }

        // Item updated
        case 1: {
            if (notifierConstants.updatedItems & notifierSettings)
                return "Item updated"
            return null
        }

        // New special
        case 2: {
            if (notifierConstants.specials & notifierSettings)
                return "New special"
            return null
        }

        // New timed item
        case 3: {
            if (notifierConstants.newItems & notifierSettings)
                return "New timed item"
            return null
        }

        // Custom title of first item in the shop
        case 4: {
            if (notifierConstants.firstItem & notifierSettings)
                return packet.Title

            // Fall-thru
        }
        default: {
            return null
        }
    }
}

function announcement(packet) {
    // Notification ID format:
    // (Notification type)-U(URL type)-(Current date)
    browser.notifications.create(`1-U${packet.URL}-${Date.now()}`, {
        "type": "basic",
        "iconUrl": "https://www.brick-hill.plus/static/media/bhp.png",
        "title": "Brick Hill+",
        "message": packet.Message
    });
}

function newTweet(packet) {
    browser.notifications.create(`2-${packet.TweetID}-${Date.now()}`, {
        "type": "basic",
        "iconUrl": "https://www.brick-hill.plus/static/media/bhp.png",
        "title": "New tweet",
        "message": packet.Tweet
    });
}

browser.notifications.onClicked.addListener(notificationID => {
    // match[0]: Full ID
    // match[1]: Notification type
    // match[2]: Item ID or URL type
    const match = notificationID.match(/([0-2])-(\U[0-1]|[0-9]+)-[0-9]+/)
    if (match.length !== 3)
        return
    
    let url = ""

    switch (match[1]) {
        case "0": {
            // Check if match[2] is there. If it is, then link to that page.
            // If not, just go to the main shop
            if (match[2].length > 0) {
                url = "https://www.brick-hill.com/shop/" + match[2]
            } else {
                url = "https://www.brick-hill.com/shop/"
            }
            break
        }
        // Clan announcement.
        case "1": {
            if (match[2][1] == "1")
                url = "https://www.brick-hill.com/clan/6815/"
            else
                url = "https://www.brick-hill.plus/"
            break
        }
        case "2": {
            url = "https://twitter.com/hillofbricks/status/" + match[2]
            break
        }
        default:
            break
    }

    browser.tabs.create({ url });
    browser.notifications.clear(notificationID)
})
