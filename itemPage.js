const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))
const bucksConversion = bhpSettings.shopConversions || 0.01
const allowedItemTypes = [ "Hat", "Head", "Tool", "Face" ]
const allowed3DItemTypes = [ "Hat", "Tool" ]

// only set itemType if we are on an item page, not just /shop/
const itemType = (!window.location.href.match(/[0-9]+/)) ? null : document.getElementsByClassName("padding-bottom")[0].childNodes[1].childNodes[3].innerText
const itemId = (!window.location.href.match(/[0-9]+/)) ? null : window.location.href.match(/[0-9]+/)[0]

if (allowed3DItemTypes.includes(itemType)) {
	const scene = new THREE.Scene()
	const light = new THREE.HemisphereLight(0xFFFFFF, 0xB1B1B1, 1);
	scene.add(light);
	
	const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
	camera.position.set( -2.97, 5.085, 4.52 );
	
	const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.domElement.style = "display:none;user-select:none"
	renderer.setSize( 375, 375 );
	
	const itemBox = document.querySelector("div.box.relative.shaded.item-img")
	const itemBoxChildren = itemBox.childNodes
	itemBox.insertBefore(renderer.domElement, itemBoxChildren[0])

	const texture = new THREE.TextureLoader();
	const mapOverlay = texture.load(`https://api.brick-hill.com/v1/games/retrieveAsset?id=${itemId}&type=png`);
	const material = new THREE.MeshPhongMaterial({map: mapOverlay});
	
	const box3D = new THREE.Box3()
	const OBJloader = new THREE.OBJLoader();
	
	OBJloader.load(
		`https://api.brick-hill.com/v1/games/retrieveAsset?id=${itemId}&type=obj`,
		object => {
			object.traverse(node => {
				if (node.isMesh) node.material = material
			})
	
			// Setting the center of the camera to be the center of the object
			box3D.setFromObject(object);
			box3D.center(controls.target);
	
			scene.add( object );
		},
		xhr => {},
		err => {}
	);
	
	// camera controls
	var controls = new THREE.OrbitControls( camera, itemBox );
	controls.autoRotate = true;
	controls.enableZoom = true;
	controls.minDistance = 1;
	controls.maxDistance = 10;
	controls.enablePan = false
	controls.update()
	
	function render() {
		renderer.render(scene, camera);
	}
	
	function animate() {
		controls.update()
		requestAnimationFrame(animate);
		render();
	}
	
	animate();
	
	const view3D = document.createElement("button")
	view3D.classList = "button medium green f-right"
	view3D.style = "position:relative;right:-45px;"
	view3D.innerText = "3D View"
	itemBox.insertBefore(view3D, itemBoxChildren[itemBoxChildren.length - 1])
	
	const view2D = document.createElement("button")
	view2D.classList = "button medium blue f-right"
	view2D.style = "position: relative;top:-45px;right: 5px;display:none"
	view2D.innerText = "2D View"
	itemBox.insertBefore(view2D, itemBoxChildren[itemBoxChildren.length - 1])
	
	view3D.addEventListener("click", () => {
		view3D.style.display = "none"
		view2D.style.display = ""
		itemBox.style.padding = "0"
		renderer.domElement.style.display = ""
	
		// Reset camera every time they want to see the item again
		camera.position.set( -2.97, 5.085, 4.52 );

		itemBoxChildren[2].style.display = "none"
	})
	
	view2D.addEventListener("click", () => {
		view2D.style.display = "none"
		view3D.style.display = ""
		itemBox.style.padding = "50px"
		renderer.domElement.style.display = "none"
	
		itemBoxChildren[2].style.display = ""
	})
	
}

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
		downloadTexture.href = `https://api.brick-hill.com/v1/games/retrieveAsset?id=${itemId}&type=png`
	
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

function getBHPData(callback) {
	fetch(`https://api.bhvalues.com/v1/item/${itemId}`)
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
	linkA.href = `https://www.bhvalues.com/item/${itemId}`

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
	infoText.href = "https://www.bhvalues.com/"

	const bhvLink = document.createElement("a")
	bhvLink.style = "color:cornflowerblue;font-size:12px"
	bhvLink.innerText = "Brick Hill Values"
	bhvLink.href = "https://www.bhvalues.com/"

	getBHPData(data => {
		if (data.err) {
			linkA.innerText += " on "

			const okLink = document.createElement("a")
			okLink.style = "color:cornflowerblue"
			okLink.innerText = "Brick Hill Values"
			okLink.href = "https://www.bhvalues.com/items/" + itemId
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