function getBHPData(callback) {
	fetch(`https://api.brick-hub.com/v1/item/${itemID}`)
	.then(res => res.json())
	.then(data => {
		callback(data)
	})
	.catch()
}

// small-text mt6 mb2
function getBHPlusData() {

	const linkDiv = document.createElement("div")
	linkDiv.className = "item-stats"
	
	const linkA = document.createElement("a")
	linkA.innerText = "View Owners and More Details"
	linkA.href = `https://trade.brick-hub.com/item/${itemID}`

	const mainDiv = document.createElement("div")
	mainDiv.className = "item-stats"

	mainDiv.appendChild(document.createElement("br"))

	const valueButton = document.createElement("button")
	valueButton.className = "button green flat no-cap small"

	const demandButton = document.createElement("button")
	demandButton.className = "button orange flat no-cap small"
	demandButton.style = "margin-left: 5px"

	const shorthandButton = document.createElement("button")
	shorthandButton.className = "button blue flat no-cap small"
	shorthandButton.style = "margin-left: 5px"

	const infoText = document.createElement("a")
	infoText.innerText = "Item stats and info powered by "
	infoText.style = "font-size:12px"
	infoText.href = "https://trade.brick-hub.com/"

	const bhvLink = document.createElement("a")
	bhvLink.style = "color:cornflowerblue;font-size:12px"
	bhvLink.innerText = "Brick Hill Values"
	bhvLink.href = "https://trade.brick-hub.com/"

	getBHPData(data => {
		if (data.err) {
			linkA.innerText += " on "

			const okLink = document.createElement("a")
			okLink.style = "color:cornflowerblue"
			okLink.innerText = "Brick Hill Values"
			okLink.href = "https://trade.brick-hub.com/item/" + itemID
			linkA.appendChild(okLink)
			linkDiv.appendChild(linkA)
			return
		}

		valueButton.innerText = `Value: ${data.value.toLocaleString()}`
		demandButton.innerText = `Demand: ${data.demand}`
		shorthandButton.innerText = `Shorthand: ${data.shorthand}`

		linkDiv.appendChild(linkA)

		mainDiv.appendChild(valueButton)
		mainDiv.appendChild(demandButton)
		mainDiv.appendChild(shorthandButton)

		mainDiv.appendChild(document.createElement("br"))
		mainDiv.appendChild(infoText)
		mainDiv.appendChild(bhvLink)
	})

	return [ mainDiv, linkDiv ]
}