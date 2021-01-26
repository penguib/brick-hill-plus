const userID = $("meta[name='user-data']").attr("data-id")
const csrfToken = $("meta[name='csrf-token']").attr("content")
const tradeApi = "https://api.brick-hill.com/v1/user/trades/"

let lastTradeId = null
let c = 0

async function getTradeData(userID) {
    let req = await fetch(tradeApi + userID + "/inbound?limit=1", { credentials: "include" })
    return await req.json()
}


setInterval(() => {


    let tradeData = await getTradeData(userID)
    let json = tradeData.data[0]
    if (json.id !== lastTradeId) {
        lastTradeId = json.id

        // chrome.extension.sendRequest({data: json}, function(response) { // optional callback - gets response
        //     console.log(response.returnMsg);
        // });

        // new Notification(`New trade from ${json.user.username}`, {
        //     body: "hello, world!",
        //     icon: `https://brkcdn.com/images/avatars/${json.user.avatar_hash}.png`
        // })

        browser.runtime.sendMessage("1", "hello, world!")
    }

}, 1 * 1000);
// updates every 30 seconds because how often do we really need to check