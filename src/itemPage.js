const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))
const bucksConversion = bhpSettings.shopConversions || 0.01
const allowedItemTypes = [ "Hat", "Head", "Tool", "Face" ]
const allowed3DItemTypes = [ "Hat", "Tool" ]
const userID = $("meta[name='user-data']")?.attr("data-id")

// only set itemType if we are on an item page, not just /shop/
const itemType = (!window.location.href.match(/[0-9]+/)) ? null : document.getElementsByClassName("padding-bottom")[0].childNodes[1].childNodes[3].innerText
const itemID = (!window.location.href.match(/[0-9]+/)) ? null : window.location.href.match(/[0-9]+/)[0];

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

    $(li).click(() => {
        navigator.clipboard.writeText(itemImage.src)
        setTimeout(() => {
            $(li).css("color", "")
            $(a).text("Copy Item Img")
        }, 2000)
        $(li).css("color", "lightgreen")
        $(a).text("Copied ✓")
    })

    if (!ul.children[0])
        ul.appendChild(li)
    else
        ul.insertBefore(li, ul.children[0])

	const view3D = document.createElement("button")
	view3D.classList = "button medium green f-right"
	view3D.style = "position: relative; right: -45px;"
	view3D.innerText = "3D"

	const tryOnBtt = document.createElement("button")
	tryOnBtt.classList = "button medium green f-left"
	tryOnBtt.style = "position: relative; left: -45px;"
	tryOnBtt.innerText = "Try On"

	const toggleTryOn = color => {
		const btt = $(tryOnBtt)
		switch (color) {
			case "red": {
				btt.removeClass("green")
				btt.addClass("red")
				btt.text("Take Off")
				break
			}
			case "green": {
				btt.removeClass("red")
				btt.addClass("green")
				btt.text("Try On")
				break
			}
		}
	}

	if (allowed3DItemTypes.includes(itemType)) {
		const scene = new THREE.Scene()
		const light = new THREE.HemisphereLight(0xFFFFFF, 0xB1B1B1, 1);
		scene.add(light);
		
		const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
		camera.position.set( -2.97, 5.085, 4.52 );
		
		const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		renderer.setSize( 375, 375 );
		renderer.domElement.style = "display: none; user-select: none; width: 100%"
		$(renderer.domElement).attr('id', 'item-viewer')

		itemBox.insertBefore(renderer.domElement, itemBoxChildren[0])
		itemBox.insertBefore(view3D, itemBoxChildren[itemBoxChildren.length - 1])

		// Download buttons are broken
		const itemData = await getAssetURL(itemID)
	
		const texture = new THREE.TextureLoader();
		const mapOverlay = texture.load(itemData.texture.url);
		const material = new THREE.MeshPhongMaterial({map: mapOverlay});
		
		const box3D = new THREE.Box3()
		const OBJloader = new THREE.OBJLoader();

		const parseOBJ = (mesh, cb) => {
			const FileLoader = new THREE.FileLoader()
			FileLoader.load(mesh, data => {
				const lines = data.split('\n')
				const parsedFile = lines.filter(line => {
					return line.indexOf("l") != 0
				})
				cb(parsedFile.join('\r\n'))
			})
		}

		parseOBJ(itemData.mesh.url, parsed => {
			let model = OBJloader.parse(parsed)
			model.traverse(child => {
				child.material = material
			})

			box3D.setFromObject(model);
			box3D.center(controls.target);
			scene.add(model)
		})
		
		// camera controls
		var controls = new THREE.OrbitControls( camera, itemBox );
		controls.autoRotate = true;
		controls.enableZoom = true;
		controls.minDistance = 1;
		controls.maxDistance = 10;
		controls.enablePan = false
		controls.update()
		
		
		function animate() {
			controls.update()
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
		}
		
		animate();
		

		view3D.addEventListener("click", () => {
			const itemViewer   = $("#item-viewer")
			const itemImg      = $("#item-img")
			const avatarViewer = $("#avatar-viewer")
			if (view3D.innerText.includes("3D")) {
				
				// Setting the height prevents an annoying resizing bug
				$(itemContainer).css("height", comp.height)
				view3D.innerText = "2D"
				
				itemViewer.show()
				itemImg.hide()
				avatarViewer.hide()
				toggleTryOn("green")

				const pos = quad => { return {
					"top": "-50px",
					[[quad]]: "5px"
				}}

				$(view3D).css( pos("right") )
				$(tryOnBtt).css( pos("left") )

				// Reset camera every time they want to see the item again
				camera.position.set( -2.97, 5.085, 4.52 );
		
				itemBox.style.padding = "0"
				return
			}

			view3D.innerText = "3D"
			renderer.domElement.style.display = "none"

			const pos = quad => { return {
				"top": "",
				[[quad]]: "-45px"
			}}

			itemViewer.hide()
			avatarViewer.hide()
			itemImg.show()
			toggleTryOn("green")

			$(itemContainer).css("height", "")
			$(view3D).css( pos("right") )
			$(tryOnBtt).css( pos("left") )
		
			// Reset camera every time they want to see the item again
			camera.position.set( -2.97, 5.085, 4.52 );
	
			itemBox.style.padding = "50px"
		})
	}

	// If the userID is undefined, then the user isn't logged in
	// Users not logged in can't try on items
	if (!userID)
		return

	itemBox.insertBefore(tryOnBtt, itemBoxChildren[itemBoxChildren.length - 1])

	const rendererData = await Render(userID, itemBox, itemID)
	const avatarRenderer = rendererData.renderer
	const avatarCamera = rendererData.camera
	avatarRenderer.setSize( 375, 375 );
	avatarRenderer.domElement.style = "display: none; user-select: none; width: 100%"
	$(avatarRenderer.domElement).attr('id', 'avatar-viewer')
	itemBox.insertBefore(avatarRenderer.domElement, itemBoxChildren[0])


	$(tryOnBtt).click(() => {
		const itemViewer   = $("#item-viewer")
		const itemImg      = $("#item-img")
		const avatarViewer = $("#avatar-viewer")
		const cameraPosition = new THREE.Vector3(-3.667381161503485, 5.669098837327955, 5.5813344027963065)

		if (tryOnBtt.innerText.toLowerCase().includes("try on")) {

			// Can't pass in the vector unfortunately
			avatarCamera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)

			$(itemContainer).css("height", comp.height)
			avatarViewer.show()
			toggleTryOn("red")

			const pos = quad => { return {
				"top": "-50px",
				[[quad]]: "5px"
			}}

			itemImg.hide()
			if (itemViewer.length) {
				itemViewer.hide()
				$(view3D).css( pos("right") )
			}
			$(tryOnBtt).css( pos("left") )

			itemBox.style.padding = "0"

			return
		}

		$(itemContainer).css("height", comp.height)
			toggleTryOn("green")

			const pos = quad => { return {
				"top": "",
				[[quad]]: "-45px"
			}}

			itemImg.show()
			if (itemViewer.length) {
				itemViewer.hide()
				$(view3D).css( pos("right") )
			}
			avatarViewer.hide()
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


function createDownloadElements(itemType) {
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
		downloadTexture.href = `https://api.brick-hill.com/v1/games/retrieveAsset?id=${itemID}&type=png`
	
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
		downloadModel.href = `https://api.brick-hill.com/v1/games/retrieveAsset?id=${itemID}&type=obj`

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
	let secondDiv = document.getElementsByClassName("card mb4")[0]
	
	
	container.insertBefore(element, secondDiv.nextSibling)
}

let statsDiv = document.getElementsByClassName("small-text mt6 mb2")[0]
let bhpData = getBHPlusData()

statsDiv.appendChild(bhpData[1])
statsDiv.appendChild(bhpData[0])