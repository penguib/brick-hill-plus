const bucksConversion = bhpSettings.shopConversions || 0.01
const allowedItemTypes = [ "Hat", "Head", "Tool", "Face" ]
const allowed3DItemTypes = [ "Hat", "Tool" ]
const userID = $("meta[name='user-data']")?.attr("data-id")

// To keep track if the user actually wants to see them in 3D
// No reason to render it if the user won't use it
let loadedItem = false
let loadedUser = false

// only set itemType if we are on an item page, not just /shop/
const itemType = (!window.location.href.match(/[0-9]+/)) ? null : document.getElementsByClassName("padding-bottom")[0].childNodes[1].childNodes[3].innerText
const itemID = (!window.location.href.match(/[0-9]+/)) ? null : window.location.href.match(/[0-9]+/)[0];

$(document).ready(async() => {
	(async () => {

		const itemBox = document.querySelector("div.box.relative.shaded.item-img")
		const itemBoxChildren = itemBox.childNodes
	
		// Gets rids of annoying blue outline when clicked on
		$(itemBox).css("outline", "none")
	
		// Adding an ID to the img to make it easier to get later
		$(itemBoxChildren[1]).attr("id", "item-img")
	
		const itemContainer = $("div[class='content item-page']")[0]
		$(itemContainer).css("overflow", "hidden")
		let comp = window.getComputedStyle(itemContainer)
		
		//dropdown-content
		const dropDown = $("div[class='dropdown-content']")[0]
		const ul = $(dropDown).find('ul')[0]
		const li = document.createElement('li')
		const a = document.createElement('a')
		a.innerText = "Copy Item URL"
		li.appendChild(a)
	
		const userContainer = document.querySelector("div.content.text-center.bold.medium-text.relative.ellipsis")
		$(userContainer).css("outline", "none")
		const itemImage = document.getElementById("item-img")

		const view3D = document.createElement("button")
		view3D.classList = "button medium green f-right"
		view3D.style = "position: relative; right: -45px; top: 7px"
		view3D.innerText = "3D"

		const tryOnBtt = document.createElement("button")
		tryOnBtt.classList = "button medium green f-left"
		tryOnBtt.style = "position: relative; left: -45px; top: 7px"
		tryOnBtt.innerText = "Try On"
		
		// If the user is logged out
		if (!userID)
			$(tryOnBtt).hide()

		const loadingContainer = document.createElement("div")
	
		// //let containerHeight = ($(itemBox).hasClass("special") || $(itemBox).hasClass("owns")) ? "271px" : "279px"

		$(loadingContainer).css("height", window.getComputedStyle(document.getElementById("item-img")).height)
		$(loadingContainer).hide()
		const loadingGif = document.createElement("div")
		loadingGif.classList = "loader"
		loadingContainer.appendChild(loadingGif)
	
		itemBox.insertBefore(loadingContainer, itemImage)

		const toggleButtons = (element, color, text) => {
			const btt = $(element)
			btt.text(text)
			switch (color) {
				case "red": {
					btt.removeClass("green")
					btt.addClass("red")
					break
				}
				case "green": {
					btt.removeClass("red")
					btt.addClass("green")
					break
				}
			}
		}
	
		if (allowed3DItemTypes.includes(itemType)) {
			itemBox.insertBefore(view3D, itemBoxChildren[itemBoxChildren.length - 1])

			view3D.addEventListener("click", async () => {
				const itemImg      = $("#item-img")
				const avatarViewer = $("#avatar-viewer")
				if (view3D.innerText.includes("3D")) {

					// Setting the height prevents an annoying resizing bug
					$(itemContainer).css("height", comp.height)

					if (!loadedItem) {
						itemImg.hide()
						if (avatarViewer.length)
							avatarViewer.hide()

						$(loadingContainer).show()
						loadedItem = await renderItem(itemID, itemBox)
						$(loadingContainer).hide()

						itemBox.insertBefore(loadedItem.renderer.domElement, itemBoxChildren[0])
					}
						
					$(loadedItem.renderer.domElement).show()
					
					toggleButtons(view3D, "red", "2D")

					itemImg.hide()
					avatarViewer.hide()
					toggleButtons(tryOnBtt, "green", "Try on")
	
					const pos = quad => { return {
						"top": "-43px",
						[[quad]]: "5px"
					}}
	
					$(view3D).css( pos("right") )
					$(tryOnBtt).css( pos("left") )
	
					// Reset camera every time they want to see the item again
					loadedItem.camera.position.set( -2.97, 5.085, 4.52 );
			
					itemBox.style.padding = "0"
					return
				}
	
				toggleButtons(view3D, "green", "3D")

				loadedItem.renderer.domElement.style.display = "none"
	
				const pos = quad => { return {
					"top": "7px",
					[[quad]]: "-45px"
				}}
	
				$(loadedItem.renderer.domElement).hide()
				avatarViewer.hide()
				itemImg.show()
				toggleButtons(tryOnBtt, "green", "Try on")
	
				$(itemContainer).css("height", "")
				$(view3D).css( pos("right") )
				$(tryOnBtt).css( pos("left") )
			
				// Reset camera every time they want to see the item again
				loadedItem.camera.position.set( -2.97, 5.085, 4.52 );
		
				itemBox.style.padding = "50px"
			})
		}
		itemBox.insertBefore(tryOnBtt, itemBoxChildren[itemBoxChildren.length - 1])
	
		$(li).click(() => {
			navigator.clipboard.writeText(itemImage.src)
			setTimeout(() => {
				$(li).css("color", "")
				$(a).text("Copy Item Img")
			}, 2000)
			$(li).css("color", "lightgreen")
			$(a).text("Copied ✓")
		})
	
		if (!ul?.children[0])
			ul.appendChild(li)
		else
			ul.insertBefore(li, ul.children[0])
	
		const itemData = await getAssetURL(itemID)

		if (allowedItemTypes.includes(itemType)) {
			let element = createDownloadElements(itemType, itemData.texture, itemData.mesh)
			let container = document.getElementsByClassName("col-10-12 push-1-12 item-holder")[0]
			let secondDiv = document.getElementsByClassName("card mb4")[0]
			
			
			container.insertBefore(element, secondDiv.nextSibling)
		}
	
		// If the userID is undefined, then the user isn't logged in
		// Users not logged in can't try on items
		if (!userID)
			return

		$(tryOnBtt).click(async () => {
			const itemViewer   = $("#item-viewer")
			const itemImg      = $("#item-img")
			const cameraPosition = new THREE.Vector3(-3.667381161503485, 5.669098837327955, 5.5813344027963065)
	
			if (tryOnBtt.innerText.toLowerCase().includes("try on")) {
	
				$(itemContainer).css("height", comp.height)

				if (!loadedUser) {
					$(loadingContainer).show()

					itemImg.hide()
					if (itemViewer.length)
						itemViewer.hide()
					$(view3D).text("3D")

					loadedUser = await renderUser(userID, itemBox, itemID) 
					$(loadingContainer).hide()

					const avatarRenderer = loadedUser.renderer
					const avatarCamera = loadedUser.camera
					avatarRenderer.setSize( 375, 375 );
					avatarRenderer.domElement.style = "display: none; user-select: none; width: 100%"
					$(avatarRenderer.domElement).attr('id', 'avatar-viewer')
					itemBox.insertBefore(avatarRenderer.domElement, itemBoxChildren[0])

					avatarCamera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
				
				}

				// Can't pass in the vector unfortunately
				loadedUser.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)

				$(loadedUser.renderer.domElement).show()
				toggleButtons(tryOnBtt, "red", "Take off")
				toggleButtons(view3D, "green", "3D")
	
				const pos = quad => { return {
					"top": "-43px",
					[[quad]]: "5px"
				}}
	
				itemImg.hide()
				if (itemViewer.length)
					itemViewer.hide()
					
				$(view3D).css( pos("right") )
				$(view3D).text("3D")
				$(tryOnBtt).css( pos("left") )
	
				itemBox.style.padding = "0"
	
				return
			}
	
			$(itemContainer).css("height", comp.height)
				toggleButtons(tryOnBtt, "green", "Try on")
				toggleButtons(view3D, "green", "3D")
	
				const pos = quad => { return {
					"top": "7px",
					[[quad]]: "-45px"
				}}
	
				itemImg.show()
				if (itemViewer.length)
					itemViewer.hide()
				$(view3D).css( pos("right") )
				$(loadedUser.renderer.domElement).hide()
				$(tryOnBtt).css( pos("left") )
	
				itemBox.style.padding = "0"
			
			itemBox.style.padding = "50px"
		})

		
	})()
	
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
	
	
	function createDownloadElements(itemType, texture, mesh) {
		let mainDiv = document.createElement("div")
		mainDiv.className = "card mb2"
	
		let contentDiv = document.createElement("div")
		contentDiv.className = "content item-page"
		mainDiv.appendChild(contentDiv)
	
		// if the item is anything BUT a head, add the download texture option
		if (itemType !== "Head") {
			let downloadTexture = document.createElement("a")
			downloadTexture.className = "button green mobile-fill"
			downloadTexture.style = "font-size: 15px;padding:10px"
			downloadTexture.innerText = "Download Texture"
			downloadTexture.href = texture
		
			let textureDiv = createDivContainer()
			textureDiv.appendChild(downloadTexture)
			contentDiv.appendChild(textureDiv)
		}
	
		// if the item is anything BUT a face, add the download model option
		if (itemType !== "Face") {
			let downloadModel = document.createElement("a")
			downloadModel.className = "button blue mobile-fill"
			downloadModel.style = "font-size: 15px;padding:10px"
			downloadModel.innerText = "Download Model"
			downloadModel.href = mesh
	
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
			Array.from(elements).forEach(e => {
				if (document.contains(e)) {
					resellerPriceConversion(e)
				}
			})
	
			// stop observing if the "Load More" button is gone 
			if (!document.querySelector("button.forum-create-button.green"))
				ob.disconnect()
		})
	}

	
})