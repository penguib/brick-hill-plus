const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))
const bucksConversion = bhpSettings.shopConversions || 0.01
const allowedItemTypes = [ "Hat", "Head", "Tool", "Face" ]
const allowed3DItemTypes = [ "Hat", "Tool" ]

const cameraPosition = [ -2.97, 5.085, 4.52 ]
const canvasSize = 375

// only set itemType if we are on an item page, not just /shop/
const itemType = (!window.location.href.match(/[0-9]+/)) ? null : document.getElementsByClassName("padding-bottom")[0].childNodes[1].childNodes[3].innerText
const itemId = (!window.location.href.match(/[0-9]+/)) ? null : window.location.href.match(/[0-9]+/)[0]

if (allowed3DItemTypes.includes(itemType)) {
	const scene = new THREE.Scene()
	const light = new THREE.HemisphereLight(0xFFFFFF, 0xB1B1B1, 1);
	scene.add(light);
	
	const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
	//camera.position.set( cameraPosition[0], cameraPosition[1], cameraPosition[2] );
	
	const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.domElement.style = "display:none;user-select:none"
	renderer.setSize(canvasSize, canvasSize);
	renderer.domElement.style.width = "100%"
	renderer.domElement.style.height = "100%"
	
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
				if (node.isMesh) 
					node.material = material
			})
	
			// Setting the center of the camera to be the center of the object
			box3D.setFromObject(object);
			box3D.center(controls.target);
	
			scene.add(object);
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

	function animate() {
		controls.update()
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}

	animate()

	const view3D = document.createElement("button")
	view3D.classList = "button medium green f-right"
	view3D.style = "position:relative;right:-45px;"
	view3D.innerText = "3D View"
	itemBox.insertBefore(view3D, itemBoxChildren[itemBoxChildren.length - 1])
	
	const view2D = document.createElement("button")
	view2D.classList = "button medium blue f-right"
	view2D.style = "position: relative;right: -45px;display:none"
	view2D.innerText = "2D View"
	itemBox.insertBefore(view2D, itemBoxChildren[itemBoxChildren.length - 1])
	
	view3D.addEventListener("click", () => {
		view3D.style.display = "none"
		view2D.style.display = ""
		renderer.domElement.style.display = ""
	
		// Reset camera every time they want to see the item again
		camera.position.set( cameraPosition[0], cameraPosition[1], cameraPosition[2] );

		itemBoxChildren[2].style.display = "none"
	})
	
	view2D.addEventListener("click", () => {
		view2D.style.display = "none"
		view3D.style.display = ""
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

