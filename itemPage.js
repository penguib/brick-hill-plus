const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))
const bucksConversion = bhpSettings.shopConversions || 0.01
const allowedItemTypes = [ "Hat", "Head", "Tool", "Face" ]

// only set itemType if we are on an item page, not just /shop/
const itemType = (!window.location.href.match(/[0-9]+/)) ? null : document.getElementsByClassName("padding-bottom")[0].childNodes[1].childNodes[3].innerText



let moreSellersButton = null
let sellingItemsCount = 0

function numberWithCommas(x) {
    if (x == undefined)
        return "";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function createDivContainer() {
	let div = document.createElement("div")
	div.className = "col-12-12 mobile-col-1-2"
	return div
}

function resellerPriceConversion(sellingElement) {
	for (price of sellingElement) {
		if (price.innerText.match(/\$/)) continue
		let amount = price.innerText.match(/[0-9]+/)
		price.innerText += ` ($${ numberWithCommas((bucksConversion * amount).toFixed(2)) })`
		++sellingItemsCount
	}
}

function createDownloadElements(itemType) {
	const itemId = window.location.href.match(/[0-9]+/)[0]

	let mainDiv = document.createElement("div")
	mainDiv.className = "card mb2"

	let contentDiv = document.createElement("div")
	contentDiv.className = "content item-page"
	mainDiv.appendChild(contentDiv)

	let downloadTexture = document.createElement("a")
	downloadTexture.className = "button green mobile-fill"
	downloadTexture.style = "font-size: 15px;padding:10px"
	downloadTexture.innerText = "Download Texture"
	downloadTexture.href = `https://api.brick-hill.com/v1/games/retrieveAsset?id=${itemId}&type=png`

	let textureDiv = createDivContainer()
	textureDiv.appendChild(downloadTexture)
	contentDiv.appendChild(textureDiv)

	// if the item is anything BUT a face, add the download model option
	if (itemType !== "Face") {
		let downloadModel = document.createElement("a")
		downloadModel.className = "button blue mobile-fill"
		downloadModel.style = "font-size: 15px;padding:10px"
		downloadModel.innerText = "Download Model"
		downloadModel.href = `https://api.brick-hill.com/v1/games/retrieveAsset?id=${itemId}&type=obj`

		let modelDiv = createDivContainer()
		modelDiv.appendChild(downloadModel)
		contentDiv.appendChild(modelDiv)
	}

	return mainDiv
}

let checkForElement = setInterval(() => {
	// 0 means that the user disabled conversions on the shop
	if (bucksConversion == 0) {
		return clearInterval(checkForElement)
	}

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
		let calculation = bucksConversion * (bitsAmount / 10)
		let calculationText = (calculation < 0.01) ? " (< $0.01)" : ` ($${numberWithCommas(calculation.toFixed(2))})`
		bitsDiv[0].innerText += calculationText
	}

}, 100)


if (document.getElementsByClassName("box relative shaded item-img  special ") && bucksConversion != 0) {
	const loadMoreResellers = document.getElementsByClassName("forum-create-button green")
	const sellingElement = document.getElementsByClassName("button bucks small flat")

	let waitForResellers = setInterval(() => {
		if (sellingElement.length) {
			clearInterval(waitForResellers)
			resellerPriceConversion(sellingElement)
		}
	}, 100)


	// we need to wait for the button to load more sellers
	let waitForMoreResellers = setInterval(() => {
		if (loadMoreResellers.length) {
			clearInterval(waitForMoreResellers)
			$(loadMoreResellers[0]).click(() => {

				// we need to wait for the new sellers to be appended to the DOM before we calculate the price
				let waitForResellers = setInterval(() => {
					let elements = document.getElementsByClassName("button bucks small flat")
					if (elements.length > sellingItemsCount) {
						clearInterval(waitForResellers)
						resellerPriceConversion(elements)
					}
				}, 100)

			})
		}
	}, 100)
}

if (allowedItemTypes.includes(itemType)) {
	let element = createDownloadElements(itemType)
	console.log(element)
	let container = document.getElementsByClassName("col-10-12 push-1-12 item-holder")[0]

	container.appendChild(element)
}

