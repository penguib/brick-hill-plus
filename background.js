// chrome.extension.onRequest.addListener(request => {
//     // let data = request.data
//     // let newTrade = new Notification(`New trade from ${data.user.username}`, {
//     //     body: "hello, world!",
//     //     icon: `https://brkcdn.com/images/avatars/${data.user.avatar_hash}.png`
//     // })

//     // newTrade.onclick = event => {
//     //     event.preventDefault()
//     //     window.open("https://www.brick-hill.com/trades")
//     // }

// })
// let c = 0

// setInterval(() => {

//     ++c
//     console.log(c)

//     // let tradeData = await getTradeData(userID)
//     // let json = tradeData.data[0]
//     // if (json.id !== lastTradeId) {
//     //     lastTradeId = json.id

//     //     // chrome.extension.sendRequest({data: json}, function(response) { // optional callback - gets response
//     //     //     console.log(response.returnMsg);
//     //     // });

//     //     new Notification(`New trade from ${json.user.username}`, {
//     //         body: "hello, world!",
//     //         icon: `https://brkcdn.com/images/avatars/${json.user.avatar_hash}.png`
//     //     })
//     // }

// }, 1 * 1000);

browser.runtime.onMessage.addListener(message => {
    console.log(message)
})