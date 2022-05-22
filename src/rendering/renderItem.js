var browser = browser || chrome
const headOBJ = browser.runtime.getURL("static/head.obj")
const torsoOBJ = browser.runtime.getURL("static/torso.obj")
const rArmOBJ = browser.runtime.getURL("static/right_arm.obj")
const lArmOBJ = browser.runtime.getURL("static/left_arm.obj")
const rLegOBJ = browser.runtime.getURL("static/right_leg.obj")
const lLegOBJ = browser.runtime.getURL("static/left_leg.obj")

function loadImage(path) {
    const canvas = document.createElement("canvas")
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"

    const texture = new THREE.Texture(canvas);

    const img = new Image();
    img.crossOrigin =  ""
    img.onload = function() {
        canvas.width = img.width
        canvas.height = img.height

        const context = canvas.getContext("2d")
        context.drawImage(img, 0, 0)

        texture.needsUpdate = true
    };
    img.src = path
    return texture
};

async function renderItem(itemID, container, type = "") {
    if (!itemID)
        return null

    const config = await getConfig()
    const colors = config.colors

    const itemData = await getAssetURL(itemID)
    const TextureLoader = new THREE.TextureLoader();

    const box3D = new THREE.Box3()
	const OBJloader = new THREE.OBJLoader();

    const scene = new THREE.Scene()

    const lightConfig = config.light
    const light = new THREE.HemisphereLight(lightConfig.sky_color, lightConfig.ground_color, lightConfig.intensity);
    scene.add(light);
    
    const cameraConfig = config.camera
    const camera = new THREE.PerspectiveCamera(cameraConfig.fov, cameraConfig.aspect, cameraConfig.near, cameraConfig.far);
    const cameraPosition = cameraConfig.position
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    
    const rendererConfig = config.renderer
    const rendererSize = rendererConfig.size
    const renderer = new THREE.WebGLRenderer({
            antialias: rendererConfig.anti_alias, 
            alpha:     rendererConfig.alpha
        })
    renderer.setSize(rendererSize.x, rendererSize.y);
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

    const mapOverlay = (type === "head") ? TextureLoader.load(config.merge_images.default_face) : TextureLoader.load(itemData.texture);

    switch (type.toLowerCase()) {
        case "face": {
            quickLoad(headOBJ, colors.yellow, true) 
            break;
        }
        case "shirt": {
            quickLoad(torsoOBJ, colors.gray, true)
            quickLoad(rArmOBJ, colors.yellow)
            quickLoad(lArmOBJ, colors.yellow)
            break
        }
        case "tshirt": {
            const tshirtConfig = config.tshirt
            quickLoad(torsoOBJ, colors.gray, true, false)

            const geometryConfig = tshirtConfig.geometry
            const geometry = new THREE.PlaneGeometry(geometryConfig.x, geometryConfig.y, geometryConfig.z)
            const plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                map: mapOverlay,
                transparent: true
            }))

            scene.add(plane)
            plane.renderOrder = tshirtConfig.render_order
            plane.position.y = tshirtConfig.position.y
            plane.position.z = tshirtConfig.position.z

            quickLoad(rArmOBJ, colors.yellow, false, false)
            quickLoad(lArmOBJ, colors.yellow, false, false)
            break
        }
        case "pants": {
            quickLoad(torsoOBJ, colors.gray, true)
            quickLoad(rLegOBJ, colors.white)
            quickLoad(lLegOBJ, colors.white)
            break
        }
        case "head": {
            if (itemData.texture) {
                const mergeImageConfig = config.merge_images
                const mergeImagePosition = mergeImageConfig.image_position
                mergeImages([
                    { src: itemData.texture, x: 0, y: 0 },
                    { src: mergeImageConfig.default_face, x: mergeImagePosition.x, y: mergeImagePosition.y}
                ]).then(image => {
                    parseOBJ(itemData.mesh, parsed => {
                        const model = OBJloader.parse(parsed)
                        model.traverse(child => {
                            child.material = new THREE.MeshPhongMaterial({
                                map: loadImage(image),
                                transparent: true
                            })

                            box3D.setFromObject(child);
                            box3D.center(controls.target);
                            scene.add(child)

                            const bodyColor = child.clone()
                            bodyColor.material = new THREE.MeshPhongMaterial({
                                color: colors.yellow
                            })

                            scene.add(bodyColor)
                        })
                    })
                })
                break
            }

            quickLoad(itemData.mesh, colors.yellow, true)
            break
        }
        default: {
            parseOBJ(itemData.mesh, parsed => {
                let model = OBJloader.parse(parsed)
                model.traverse(child => {
                    child.material = new THREE.MeshPhongMaterial({
                        map: TextureLoader.load(itemData.texture),
                        side: THREE.DoubleSide
                    })
                })
                box3D.setFromObject(model);
                box3D.center(controls.target);
                scene.add(model)
            })
        }
    }


    // camera controls
    const cameraControls = cameraConfig.controls
    var controls = new THREE.OrbitControls( camera, container );
    controls.autoRotate  = cameraControls.auto_rotate
    controls.enableZoom  = cameraControls.enable_zoom
    controls.minDistance = cameraControls.distance.min
    controls.maxDistance = cameraControls.distance.max
    controls.enablePan   = cameraControls.enable_pan 
    controls.update()
    
    function animate() {
        controls.update()
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    
    animate();

    return { renderer, camera }
}