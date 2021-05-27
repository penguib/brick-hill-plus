async function Render(userId, container, tryOnAsset = null) {
    if (!userId)
        return null

    const TextureLoader = new THREE.TextureLoader();
    const OBJLoader = new THREE.OBJLoader();
    const MTLLoader = new THREE.MTLLoader()

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
    let tryOn
    if (tryOnAsset)
        tryOn = await getAssetURL(tryOnAsset)

    const box3D = new THREE.Box3()

    const scene = new THREE.Scene()
    const light = new THREE.HemisphereLight(0xFFFFFF, 0xB1B1B1, 1);
    scene.add(light);

    const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    camera.position.set( -2.97, 5.085, 4.52 );

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

    const headColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.head      })
    const torsoColor = new THREE.MeshPhongMaterial({ color: userAssets.colors.torso     })
    const rArmColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.right_arm })
    const lArmColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.left_arm  })
    const rLegColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.right_leg })
    const lLegColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.left_leg  })

    const controls = new THREE.OrbitControls( camera, container );
    controls.autoRotate = true;
    controls.enableZoom = true;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.enablePan = false
    controls.update()

    MTLLoader.load("https://cdn.bhvalues.com/etc/Character.mtl", mats => {
        mats.preload()
        OBJLoader.setMaterials(mats)
        
        OBJLoader.load(
            "https://cdn.bhvalues.com/etc/Character.obj",

            object => {
                object.traverse(child => {
                    if (child instanceof THREE.Mesh) {
                        switch (child.name) {
                            case "Head_Head_Head_Circle.000": {

                                // If they are wearing headless
                                if (userAssets.head.headless || (tryOn?.type === "head" && tryOn?.headless)) {
                                    child.visible = false
                                    break
                                }
                                const faceData = userAssets.face
                                const faceMat = (tryOn?.type === "face") ? tryOn.texture.url : ((faceData) ? faceData.texture.url : "http://brkcdn.com/assets/default/face.png")
                                const existsHead = (Object.keys(userAssets.head).length > 0) || tryOn?.type === "head"

                                child.material = new THREE.MeshPhongMaterial({
                                    map: TextureLoader.load(faceMat),
                                    transparent: true,
                                    opacity: (existsHead) ? 0 : 1 // If user is wearing a head, hide the default one
                                })

                                if (existsHead) {
                                    const model = ((Object.keys(userAssets.head).length > 0) ? userAssets.head : tryOn)
                                    quickLoad(model.mesh.url, new THREE.MeshPhongMaterial({
                                        map: TextureLoader.load(faceMat),
                                        transparent: true,
                                        opacity: 1
                                    }))
                                    break
                                }

                                const bodyColor = child.clone()
                                bodyColor.material = headColor
                                scene.add(bodyColor)

                                break

                                // box3D.setFromObject(child);
                                // box3D.center(controls.target);
                            }
                            case "Left_Arm_Left_Arm_Left_Arm_Cube_Left_Arm_Cube.000": {
                                
                                const shirtData = userAssets.shirt
                                if (shirtData || tryOn?.type === "shirt") {
                                    const shirtMat = TextureLoader.load( (tryOn?.type === "shirt") ? tryOn.texture.url : shirtData.texture.url )

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
                                    const pantsMat = TextureLoader.load( (tryOn?.type === "pants") ? tryOn.texture.url : pantsData.texture.url )

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
                                    const shirtMat = TextureLoader.load( (tryOn?.type === "shirt") ? tryOn.texture.url : shirtData.texture.url )

                                    child.material = new THREE.MeshPhongMaterial({
                                        map: shirtMat,
                                        transparent: true,
                                        opacity: 1
                                    })
                                    child.renderOrder = 3
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
                                    bodyColor.position.y = bodyColor.position.z =  child.position.y = child.position.z = 3.5
                                }

                                break
                            }
                            case "Right_Leg_Right_Leg_Right_Leg_Left_Arm_Cube.006": {

                                const pantsData = userAssets.pants
                                if (pantsData || tryOn?.type === "pants") {
                                    const pantsMat = TextureLoader.load( (tryOn?.type === "pants") ? tryOn.texture.url : pantsData.texture.url )

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

                                    const pantsMat = TextureLoader.load( (tryOn?.type === "pants") ? tryOn.texture.url : pantsData.texture.url )

                                    if (shirtData || tryOn?.type === "shirt") {

                                        const shirtMat = TextureLoader.load( (tryOn?.type === "shirt") ? tryOn.texture.url : shirtData.texture.url  )
                                        const pants = child.clone()

                                        pants.material = new THREE.MeshPhongMaterial({
                                            map: pantsMat,
                                            transparent: true
                                        })
                                        pants.renderOrder = 2
                                        scene.add(pants)

                                        // Problem with transpareny with shirt + pants + tshirt
                                        child.material = new THREE.MeshPhongMaterial({
                                            map: shirtMat
                                        })

                                        child.renderOrder = 3
                                    } else {
                                        child.material = new THREE.MeshPhongMaterial({
                                            map: pantsMat,
                                            transparent: true
                                        })
                                    }

                                } else if (shirtData || tryOn?.type === "shirt") {
                                    const shirtMat = TextureLoader.load( (tryOn?.type === "shirt") ? tryOn.texture.url : shirtData.texture.url )

                                    child.material = new THREE.MeshPhongMaterial({
                                        map: shirtMat,
                                        transparent: true
                                    })
                                    child.renderOrder = 3
                                } else {
                                    child.material = torsoColor
                                    child.renderOrder = 1
                                }

                                // Render the t-shirt here with the torso
                                const tshirtData = userAssets.tshirt
                                if (tshirtData || tryOn?.type === "tshirt") {
                                    const geometry = new THREE.PlaneGeometry( 2, 1.9, 1 );
                                    const tShirtMat = TextureLoader.load( (tryOn?.type === "tshirt") ? tryOn.texture.url : tshirtData.texture.url  )
                                    const material = new THREE.MeshBasicMaterial({
                                        map: tShirtMat,
                                        transparent: true,
                                        color: userAssets.colors.torso
                                    });
                                    const plane = new THREE.Mesh( geometry, material );
                                    plane.renderOrder = 2
                                    scene.add( plane );

                                    plane.position.y = 3 
                                    plane.position.z = 0.5001
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

    /*
        Heads

        - impostor
        - headless breaks camera 
        - pyramid face
        - reserveds face
        - mutated doesnt put face on normal face
        - hocl face

        Hats
        - credit card

    */

    if (Object.keys(userAssets.head).length || tryOn?.type === "head") {
        if (userAssets.head?.headless || tryOn?.headless)
            return

        const model = ((Object.keys(userAssets.head).length > 0) ? userAssets.head : tryOn)
        quickLoad(model.mesh.url, new THREE.MeshPhongMaterial({
            color: userAssets.colors.head,
            side: THREE.DoubleSide
        }))
    }
       

    if (userAssets.tool || tryOn?.type === "tool") {
        const mesh = (tryOn?.type === "tool") ? tryOn.mesh.url : userAssets.tool.mesh.url
        const texture = (tryOn?.type === "tool") ? tryOn.texture.url : userAssets.tool.texture.url
        quickLoad(mesh, new THREE.MeshPhongMaterial({
            map: TextureLoader.load(texture)
        }))
    }
    
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

    // remove L lines to fix wireframe issue 
    if (userAssets.hats.length || tryOn?.type === "hat") {

        if (tryOn?.type === "hat") {
            parseOBJ(tryOn.mesh.url, parsed => {
                let model = OBJLoader.parse(parsed)
                model.traverse(child => {
                    child.material = new THREE.MeshPhongMaterial({
                        map: TextureLoader.load(tryOn.texture.url)
                    })
                })
                scene.add(model)
            })
        }
            

        if (userAssets.hats.length === 5) {
            for (let i = 0, len = userAssets.hats.length - 1; i < len; ++i) {
                parseOBJ(hat.mesh.url, parsed => {
                    let model = OBJLoader.parse(parsed)
                    model.traverse(child => {
                        child.material = new THREE.MeshPhongMaterial({
                            map: TextureLoader.load(hat.texture.url)
                        })
                    })
                    scene.add(model)
                })
            }
        } else {
            for (let hat of userAssets.hats) {
                parseOBJ(hat.mesh.url, parsed => {
                    let model = OBJLoader.parse(parsed)
                    model.traverse(child => {
                        child.material = new THREE.MeshPhongMaterial({
                            map: TextureLoader.load(hat.texture.url)
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