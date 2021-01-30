const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))
const bucksConversion = bhpSettings.shopConversions || 0.01
const allowedItemTypes = [ "Hat", "Head", "Tool", "Face" ]

// only set itemType if we are on an item page, not just /shop/
const itemType = (!window.location.href.match(/[0-9]+/)) ? null : document.getElementsByClassName("padding-bottom")[0].childNodes[1].childNodes[3].innerText

function createDivContainer() {
	let div = document.createElement("div")
	div.className = "col-12-12 mobile-col-1-2"
	return div
}

function resellerPriceConversion(sellingElement) {
	if (sellingElement.innerText.match(/\$/)) return
	let amount = sellingElement.innerText.match(/[0-9]+/)
	sellingElement.innerText += ` ($${ String((bucksConversion * amount).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") })`
}

function addConversions(element, bits = false) {
	if (!Number(bucksConversion)) return

	let amount = element.innerText.match(/([0-9]+)/)

	if (bits) {
		if (!amount) return
		let calculation = bucksConversion * (amount[0] / 10)
		let calculationText = (calculation < 0.01) ? " (< $0.01)" : ` ($${calculation.toFixed(2).toLocaleString()})`
		element.innerText += calculationText
		return
	}

	if (!amount) return
	element.innerText += ` ($${ (bucksConversion * amount[0]).toFixed(2).toLocaleString() })`
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

function lookForPurchaseButtons(callback) {

	const observer = new MutationObserver(callback)

	observer.observe(document, {
		childList: true,
		subtree: true
	})

}

lookForPurchaseButtons((_, ob) => {
	let bucksButton = document.querySelector("button.purchase.bucks.flat.no-cap")
	let bitsButton = document.querySelector("button.purchase.bits.flat.no-cap")
	if (document.contains(bucksButton)) {
		addConversions(bucksButton)
		ob.disconnect()
	}
	if (document.contains(bitsButton)) {
		addConversions(bitsButton, true)
		ob.disconnect()
	}
})

// if the item is special and they have conversions on
if (document.getElementsByClassName("box relative shaded item-img  special ") && bucksConversion != 0) {
	lookForPurchaseButtons((_, ob) => {
		let elements = document.querySelectorAll("a.button.bucks.small.flat")
		Array.from(elements).forEach(el => {
			if (document.contains(el)) {
				resellerPriceConversion(el)
			}
		})

		// stop observing if the "Load More" button is gone 
		if (!document.querySelector("button.forum-create-button.green"))
			ob.disconnect()
	})
}

if (allowedItemTypes.includes(itemType)) {
	let element = createDownloadElements(itemType)
	let container = document.getElementsByClassName("col-10-12 push-1-12 item-holder")[0]

	container.appendChild(element)
}