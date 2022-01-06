var browser = browser || chrome

// spamming 3d or try on will create multiple canvases

const characterMat = browser.runtime.getURL("static/Character.mtl")
const characterModel = browser.runtime.getURL("static/Character.obj")
const characterHead = browser.runtime.getURL("static/head.obj")

function loadImage(path) {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    //document.body.appendChild(canvas);

    var texture = new THREE.Texture(canvas);

    var img = new Image();
    img.crossOrigin = '' 
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;

        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);

        texture.needsUpdate = true;
    };
    img.src = path;
    return texture;
};

async function renderUser(userId, container, tryOnAsset = null) {

    if (!userId)
        return null

    const TextureLoader = new THREE.TextureLoader();
    const OBJLoader = new THREE.OBJLoader();
    const MTLLoader = new THREE.MTLLoader()

    MTLLoader.setMaterialOptions({ side: THREE.DoubleSide })

    const quickLoad = (mesh, mat) => {
        OBJLoader.load(
            mesh,
            obj => {
                obj.traverse(c => {
                    if (c instanceof THREE.Mesh)
                        c.material = mat
                })
                scene.add(obj)
            }, xhr => {}, err => {}
        )
    }

    const userAssets = await getUserAssets(userId)
    let tryOn = (tryOnAsset) ? await getAssetURL(tryOnAsset) : null

    const box3D = new THREE.Box3()
    const config = await getConfig()
    const userConfig = config.user

    const scene = new THREE.Scene()
    const lightConfig = config.light
    const light = new THREE.HemisphereLight(lightConfig.skyColor, lightConfig.groundColor, lightConfig.intensity)
    scene.add(light);

    const cameraConfig = config.camera
    const camera = new THREE.PerspectiveCamera(cameraConfig.fov, cameraConfig.aspect, cameraConfig.near, cameraConfig.far)

    const rendererConfig = config.renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: rendererConfig.anti_alias, 
        alpha:     rendererConfig.alpha 
    })

    const headColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.head      })
    const torsoColor = new THREE.MeshPhongMaterial({ color: userAssets.colors.torso     })
    const rArmColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.right_arm })
    const lArmColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.left_arm  })
    const rLegColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.right_leg })
    const lLegColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.left_leg  })

    const controlsConfig = cameraConfig.controls
    const controls = new THREE.OrbitControls( camera, container );
    controls.autoRotate  = controlsConfig.auto_rotate;
    controls.enableZoom  = controlsConfig.enable_zoom;
    controls.minDistance = controlsConfig.distance.min;
    controls.maxDistance = controlsConfig.distance.max;
    controls.enablePan   = controlsConfig.enable_pan 
    controls.update()

    MTLLoader.load(characterMat, mats => {
        mats.preload()
        OBJLoader.setMaterials(mats)
        
        OBJLoader.load(
            characterModel,

            object => {
                object.traverse(child => {
                    if (child instanceof THREE.Mesh) {
                        switch (child.name) {
                            case "Head_Head_Head_Circle.000": {
                                child.visible = false 
                                const faceData = userAssets.face
                                const faceMat = (tryOn?.type === "face") ? tryOn.texture : ((faceData) ? faceData.texture : config.merge_images.default_face)
                                const existsHead = (Object.keys(userAssets.head).length > 0) || tryOn?.type === "head"

                                
                                if (existsHead) {
                                    child.visible = false

                                    const model = (tryOn?.type === "head") ? tryOn : userAssets.head
                                    if (model.texture) {
                                        const mergeImagePosition = config.merge_images.image_position
                                        mergeImages([
                                            { src: model.texture, x: 0, y: 0 },
                                            { src: faceMat, x: mergeImagePosition.x, y: mergeImagePosition.y }
                                        ]).then(imageB64 => {
                                            parseOBJ(model.mesh, parsed => {
                                                let m = OBJLoader.parse(parsed)
                                                m.traverse(child => {
                                                    child.material =  new THREE.MeshPhongMaterial({
                                                        map: loadImage(imageB64),
                                                        transparent: true,
                                                        side: THREE.DoubleSide,
                                                    })
                                                    scene.add(child)
                                                })
                                            })
                                        })
                                    } else {
                                        quickLoad(model.mesh, new THREE.MeshPhongMaterial({
                                            map: TextureLoader.load(faceMat),
                                            transparent: true,
                                            side: THREE.DoubleSide,
                                        }))
                                    }

                                } else {
                                    
                                    quickLoad(characterHead, new THREE.MeshPhongMaterial({
                                        map: TextureLoader.load(faceMat),
                                        transparent: true,
                                        side: THREE.DoubleSide,
                                        opacity: 1,
                                    }))

                                    quickLoad(characterHead, new THREE.MeshPhongMaterial({
                                        color: userAssets.colors.head
                                    }))
                                }

                                box3D.setFromObject(child);
                                box3D.center(controls.target);

                                break
                            }
                            case "Left_Arm_Left_Arm_Left_Arm_Cube_Left_Arm_Cube.000": {
                                
                                const shirtData = userAssets.shirt
                                if (shirtData || tryOn?.type === "shirt") {
                                    const shirtMat = TextureLoader.load( (tryOn?.type === "shirt") ? tryOn.texture : shirtData.texture )

                                    child.material = new THREE.MeshPhongMaterial({
                                        map: shirtMat,
                                        transparent: true,
                                        opacity: 1
                                    })
                                } else {

                                    child.material = lArmColor

                                    // If the user is wearing a shirt, studs won't be visible
                                    // So only render studs when they aren't wearing one
                                    const studs = child.clone()

                                    studs.material = new THREE.MeshPhongMaterial({
                                        map: TextureLoader.load("http://brkcdn.com/assets/default/studs.png"),
                                        transparent: true,
                                        opacity: 1
                                    })

                                    studs.renderOrder = 2
                                    scene.add(studs)
                                }

                                const bodyColor = child.clone()
                                bodyColor.material = lArmColor
                                scene.add(bodyColor)

                                break
                            }
                            case "Left_Leg_Left_Leg_Left_Leg_Left_Arm_Cube.005": {

                                const pantsData = userAssets.pants
                                if (pantsData || tryOn?.type === "pants") {
                                    const pantsMat = TextureLoader.load( (tryOn?.type === "pants") ? tryOn.texture : pantsData.texture )

                                    child.material = new THREE.MeshPhongMaterial({
                                        map: pantsMat,
                                        transparent: true,
                                        opacity: 1
                                    })

                                } else
                                    child.material = lLegColor

                                const bodyColor = child.clone()
                                bodyColor.material = lLegColor
                                scene.add(bodyColor)

                                break
                            }
                            case "Right_Arm_Right_Arm_Right_Arm_Cube_Left_Arm_Cube.003": {

                                const shirtData = userAssets.shirt
                                if (shirtData || tryOn?.type === "shirt") {
                                    const shirtMat = TextureLoader.load( (tryOn?.type === "shirt") ? tryOn.texture : shirtData.texture )

                                    child.material = new THREE.MeshPhongMaterial({
                                        map: shirtMat,
                                        transparent: true,
                                        opacity: 1
                                    })
                                    child.renderOrder = 1
                                }
                                else {
                                    child.material = rArmColor

                                    const studs = child.clone()

                                    studs.material = new THREE.MeshPhongMaterial({
                                        map: TextureLoader.load("http://brkcdn.com/assets/default/studs.png"),
                                        transparent: true,
                                        opacity: 1
                                    })

                                    studs.renderOrder = 1
                                    scene.add(studs)

                                    if (userAssets.tool || tryOn?.type === "tool") {
                                        studs.rotation.x = -Math.PI / 2
                                        studs.position.y = studs.position.z = 3.5
                                    }
                                }
                                
                                let bodyColor = child.clone()
                                bodyColor.material = rArmColor
                                bodyColor.renderOrder = 2
                                scene.add(bodyColor)

                                if (userAssets.tool || tryOn?.type === "tool") {
                                    bodyColor.rotation.x = child.rotation.x = -Math.PI / 2;
                                    bodyColor.position.y = bodyColor.position.z = child.position.y = child.position.z = 3.5
                                }

                                break
                            }
                            case "Right_Leg_Right_Leg_Right_Leg_Left_Arm_Cube.006": {

                                const pantsData = userAssets.pants
                                if (pantsData || tryOn?.type === "pants") {
                                    const pantsMat = TextureLoader.load( (tryOn?.type === "pants") ? tryOn.texture : pantsData.texture )

                                    child.material = new THREE.MeshPhongMaterial({
                                        map: pantsMat,
                                        transparent: true,
                                        opacity: 1
                                    })
                                }
                                    
                                else
                                    child.material = rLegColor

                                const bodyColor = child.clone()
                                bodyColor.material = rLegColor
                                scene.add(bodyColor)

                                break
                            }
                            case "Torso_Torso_Torso_Cube_Left_Arm_Cube.000": {

                                const pantsData = userAssets.pants
                                const shirtData = userAssets.shirt
                                if (pantsData || tryOn?.type === "pants") {

                                    const pantsMat = TextureLoader.load( (tryOn?.type === "pants") ? tryOn.texture : pantsData.texture )

                                    if (shirtData || tryOn?.type === "shirt") {

                                        const shirtMat = TextureLoader.load( (tryOn?.type === "shirt") ? tryOn.texture : shirtData.texture  )
                                        const pants = child.clone()

                                        pants.material = new THREE.MeshPhongMaterial({
                                            map: pantsMat,
                                            transparent: true
                                        })
                                        pants.renderOrder = 1
                                        scene.add(pants)

                                        // Problem with transpareny with shirt + pants + tshirt
                                        child.material = new THREE.MeshPhongMaterial({
                                            map: shirtMat,
                                            transparent: true
                                        })
                                        child.renderOrder = 2

                                    } else {
                                        child.material = new THREE.MeshPhongMaterial({
                                            map: pantsMat,
                                            transparent: true
                                        })
                                    }

                                } else if (shirtData || tryOn?.type === "shirt") {
                                    const shirtMat = TextureLoader.load( (tryOn?.type === "shirt") ? tryOn.texture : shirtData.texture )

                                    child.material = new THREE.MeshPhongMaterial({
                                        map: shirtMat,
                                        transparent: true
                                    })
                                    child.renderOrder = 2
                                } else {
                                    child.material = torsoColor
                                    child.renderOrder = 1
                                }

                                // Render the t-shirt here with the torso
                                const tshirtData = userAssets.tshirt
                                if (tshirtData || tryOn?.type === "tshirt") {
                                    const tshirtConfig = config.tshirt
                                    const tshirtGeometry = tshirtConfig.geometry
                                    const geometry = new THREE.PlaneGeometry(tshirtGeometry.x, tshirtGeometry.y, tshirtGeometry.z);
                                    const tShirtMat = TextureLoader.load( (tryOn?.type === "tshirt") ? tryOn.texture : tshirtData.texture  )
                                    const material = new THREE.MeshBasicMaterial({
                                        map: tShirtMat,
                                        transparent: true
                                    });
                                    const plane = new THREE.Mesh( geometry, material );
                                    scene.add( plane );

                                    plane.renderOrder = tshirtConfig.render_order
                                    plane.position.y = tshirtConfig.position.y
                                    plane.position.z = tshirtConfig.position.z
                                }

                                let bodyColor = child.clone()
                                bodyColor.material = torsoColor
                                scene.add(bodyColor)
                                bodyColor.renderOrder = 1

                                break
                            }
                            default: {

                                child.material = new THREE.MeshPhongMaterial({
                                    transparent: true,
                                    opacity: 1
                                })

                                break
                            }
                        }
                    }
                    
                })


                box3D.setFromObject(object);
                box3D.center(controls.target);
                scene.add( object );

            },
            xhr => {},
            err => {}
        )
    })

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

    if (Object.keys(userAssets.head).length !== 0 || tryOn?.type === "head") {
        const model = (tryOn?.type === "head") ? tryOn : userAssets.head
        parseOBJ(model.mesh, parsed => {
            let m = OBJLoader.parse(parsed)
            m.traverse(child => {
                child.material = new THREE.MeshPhongMaterial({
                    color: userAssets.colors.head,
                    side: THREE.DoubleSide 
                })
            }) 
            scene.add(m)
        })
    }
       

    if (userAssets.tool || tryOn?.type === "tool") {
        const mesh = (tryOn?.type === "tool") ? tryOn.mesh : userAssets.tool.mesh
        const texture = (tryOn?.type === "tool") ? tryOn.texture : userAssets.tool.texture
        quickLoad(mesh, new THREE.MeshPhongMaterial({
            map: TextureLoader.load(texture),
            side: THREE.DoubleSide
        }))
    }

    // remove L lines to fix wireframe issue 
    if (userAssets.hats.length || tryOn?.type === "hat") {

        if (tryOn?.type === "hat") {
            parseOBJ(tryOn.mesh, parsed => {
                let model = OBJLoader.parse(parsed)
                model.traverse(child => {
                    child.material = new THREE.MeshPhongMaterial({
                        map: TextureLoader.load(tryOn.texture),
                        side: THREE.Doubleside
                    })
                })
                scene.add(model)
            })
        }
            

        if (userAssets.hats.length === 5) {
            for (let i = 0, len = userAssets.hats.length - 1; i < len; ++i) {
                parseOBJ(userAssets.hats[i].mesh, parsed => {
                    let model = OBJLoader.parse(parsed)
                    model.traverse(child => {
                        child.material = new THREE.MeshPhongMaterial({
                            map: TextureLoader.load(userAssets.hats[i].texture),
                            side: THREE.DoubleSide
                        })
                    })
                    scene.add(model)
                })
            }
        } else {
            for (let hat of userAssets.hats) {
                parseOBJ(hat.mesh, parsed => {
                    let model = OBJLoader.parse(parsed)
                    model.traverse(child => {
                        child.material = new THREE.MeshPhongMaterial({
                            map: TextureLoader.load(hat.texture),
                            side: THREE.DoubleSide
                        })
                    })
                    scene.add(model)
                })
            }
        }    
    }
       
    function render() {
        renderer.render(scene, camera);
    }

    function animate() {
        controls.update()
        requestAnimationFrame(animate);
        render();
    }

    animate();

    return { renderer, camera }
}