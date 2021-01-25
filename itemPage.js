const bucksConversion = 0.01

function numberWithCommas(x) {
    if (x == undefined)
        return "";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let checkForElement = setInterval(() => {
	let bucksDiv = document.getElementsByClassName("purchase bucks flat no-cap")
	let bitsDiv = document.getElementsByClassName("purchase bits flat no-cap")

	if (bucksDiv.length > 0) {
		clearInterval(checkForElement)
		let bucksAmount = bucksDiv[0].innerText.match(/([0-9]+)/)[0]
		bucksDiv[0].innerText += ` ($${ numberWithCommas((bucksConversion * bucksAmount).toFixed(2)) })`
	}

	if (bitsDiv.length > 0) {
		clearInterval(checkForElement)
		let bitsAmount = bitsDiv[0].innerText.match(/([0-9]+)/)[0]
		bitsDiv[0].innerText += ` ($${ numberWithCommas((bucksConversion * (bitsAmount / 10)).toFixed(2)) })`
	}

}, 100)
