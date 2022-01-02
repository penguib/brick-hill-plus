var browser = browser || chrome
const headOBJ = browser.runtime.getURL("static/head.obj")
const torsoOBJ = browser.runtime.getURL("static/torso.obj")
const rArmOBJ = browser.runtime.getURL("static/right_arm.obj")
const lArmOBJ = browser.runtime.getURL("static/left_arm.obj")
const rLegOBJ = browser.runtime.getURL("static/right_leg.obj")
const lLegOBJ = browser.runtime.getURL("static/left_leg.obj")

const yellow = "#F3B700"
const gray = "#A7A7A7"
const white = "#FFFFFF"

async function renderItem(itemID, container, type = "") {
    if (!itemID)
        return null

    const itemData = await getAssetURL(itemID)
    const TextureLoader = new THREE.TextureLoader();

    const box3D = new THREE.Box3()
	const OBJloader = new THREE.OBJLoader();

    const scene = new THREE.Scene()
    const light = new THREE.HemisphereLight(0xFFFFFF, 0xB1B1B1, 1);
    scene.add(light);
    
    const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    camera.position.set( -2.97, 5.085, 4.52 );
    
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize( 375, 375 );
    renderer.domElement.style = "display: none; user-select: none; width: 100%"
    $(renderer.domElement).attr('id', 'item-viewer')

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

    const quickLoad = (obj, color, center = false, texture = true) => {
        OBJloader.load(obj, model => {
            model.traverse(child => {
                child.material = new THREE.MeshPhongMaterial({
                    [[ (texture) ? "map" : "color" ]]: (texture) ? mapOverlay : color,
                    transparent: true
                })

                if (center) {
                    box3D.setFromObject(child)
                    box3D.center(controls.target)
                }

                scene.add(child)

                if (texture) {
                    const bodyColor = child.clone()
                    bodyColor.material = new THREE.MeshPhongMaterial({ color })
                    scene.add(bodyColor)
                }

            })
        })
    }

    const mapOverlay = TextureLoader.load(itemData.texture);
    const material = new THREE.MeshPhongMaterial({
        map: mapOverlay,
        side: THREE.DoubleSide
    });

    switch (type.toLowerCase()) {
        case "face": {
            quickLoad(headOBJ, yellow, true) 
            break;
        }
        case "shirt": {
            quickLoad(torsoOBJ, gray, true)
            quickLoad(rArmOBJ, yellow)
            quickLoad(lArmOBJ, yellow)
            break
        }
        case "tshirt": {
            quickLoad(torsoOBJ, gray, true, false)

            const geometry = new THREE.PlaneGeometry(2, 1.9, 1)
            const plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                map: mapOverlay,
                transparent: true
            }))

            scene.add(plane)
            plane.renderOrder = 3
            plane.position.y = 3
            plane.position.z = 0.5001

            quickLoad(rArmOBJ, yellow, false, false)
            quickLoad(lArmOBJ, yellow, false, false)
            break
        }
        case "pants": {
            quickLoad(torsoOBJ, gray, true)
            quickLoad(rLegOBJ, white)
            quickLoad(lLegOBJ, white)
            break
        }
        default: {
            parseOBJ(itemData.mesh, parsed => {
                let model = OBJloader.parse(parsed)
                model.traverse(child => {
                    child.material = material
                })

                box3D.setFromObject(model);
                box3D.center(controls.target);
                scene.add(model)
            })
        }
    }


    // camera controls
    var controls = new THREE.OrbitControls( camera, container );
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

    return { renderer, camera }
}