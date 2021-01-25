let threads = document.getElementsByClassName("thread-row")

const userApi = "https://api.brick-hill.com/v1/user/profile?id="

for (let thread of threads) {
    let innerHTML = thread.childNodes[1].innerHTML
    let match = innerHTML.match(/\/user\/(-?[0-9]+)/)[1]
    let mainDiv = thread.childNodes[1].childNodes[1]
    fetch(userApi + match)
    .then(res => res.json())
    .then(data => {
        let awards = data.awards
        let isAdmin = awards.find(award => award.award_id === 3)

        // add a break for non-admins so that the awards are under their post count
        let s = (isAdmin) ? "" : "<br>"

        for (let award of awards) {
            s += `<img src="https://www.brick-hill.com/images/awards/${award.award_id}.png" style="width:40px">`
        }
        mainDiv.innerHTML += s
    })
}