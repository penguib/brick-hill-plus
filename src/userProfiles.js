const url = window.location.href
const userId = url.match(/-?[0-9]+/)[0]
const api = "https://api.brick-hill.com/v1/games/retrieveAvatar?id="
const hatApi = "https://api.brick-hill.com/v1/shop/"
const userApi = "https://api.bhvalues.com/v1/user/"

// Creatubg each element with creatElement to prevent XSS
// Thanks to Dragonian 
function generateHTML(item, itemData) {
    let mainLink = document.createElement("a")
    mainLink.href = `/shop/${item}`

    let profileCard = document.createElement("div")
    profileCard.className = "profile-card award"
    mainLink.appendChild(profileCard)

    let img = document.createElement("img")
    img.src = `${itemData.thumbnail}`
    profileCard.appendChild(img)

    let span = document.createElement("span")
    span.className = "ellipsis"
    span.innerText = itemData.name
    profileCard.appendChild(span)

    return mainLink
}

async function getItemData(id) {
    let data = await fetch(hatApi + id)
    return data.json()
}

async function appendItems(data) {

    let mainDiv = document.createElement("div")
    mainDiv.className = "top blue"
    mainDiv.innerText = "Wearing"

    let contentDiv = document.createElement("div")
    contentDiv.className = "content"
    contentDiv.style = "text-align:center;"

    // Counting to see if the user is wearing anything at all
    let zeroCount = 0
    
    for (let hat of data.hats) {
        if (!hat) {
            ++zeroCount
            continue
        }

        let req = await getItemData(hat)
        let hatData = req.data

        contentDiv.appendChild( generateHTML(hat, hatData) )
        
    }

    for (let item of Object.values(data)) {
        if (isNaN(item)) continue
        if (!item) {
            ++zeroCount
            continue
        }
        
        let req = await getItemData(item)
        let itemData = req.data

        contentDiv.appendChild( generateHTML(item, itemData) )
    }

    if (zeroCount === 12)
        return null

    return [ mainDiv, contentDiv ]
}

async function getUserData() {
    let res = await fetch(userApi + userId)
    return res.json()
}

async function generateUserInfo() {
    const mainDiv = document.createElement("div")
    mainDiv.className = "card"

    const topDiv = document.createElement("div")
    topDiv.className = "top red"
    topDiv.innerText = "User Info"
    mainDiv.appendChild(topDiv)

    const contentDiv = document.createElement("div")
    contentDiv.className = "content"
    contentDiv.style = "text-align: center"
    mainDiv.appendChild(contentDiv)

    const container = document.createElement("div")
    container.style = "display: flex; flex-wrap: wrap; justify-content: center; gap: 10px"
    contentDiv.appendChild(container)

    const userData = await getUserData()
    
    if (userData.err) {
        const sErr = document.createElement("span")
        sErr.innerText = "User is not in Brick Hill Value's database"
        contentDiv.appendChild(sErr)

        for (let i = 0; i < 2; i++) {
            contentDiv.appendChild(document.createElement("br"))
        }

        const aCAdd = document.createElement("a")
        aCAdd.style = "color: cornflowerblue"
        aCAdd.innerText = "Click here "
        aCAdd.href = "https://wwww.bhvalues.com/user/" + userId
        contentDiv.appendChild(aCAdd)

        const aAdd = document.createElement("a")
        aAdd.innerText = "to add them!"
        aCAdd.href = "https://wwww.bhvalues.com/user/" + userId
        contentDiv.appendChild(aAdd)

    } else {
        const dValue = document.createElement("button")
        dValue.className = "button green flat no-cap"
        dValue.innerHTML = `Value: <span class="bucks-icon img-white"></span> ${userData.value.toLocaleString()}`
        container.appendChild(dValue)
    
        const dAverage = document.createElement("button")
        dAverage.className = "button orange flat no-cap"
        dAverage.innerHTML = `Averrage: <span class="bucks-icon img-white"></span> ${userData.average.toLocaleString()}`
        container.appendChild(dAverage)
    
        const dRank = document.createElement("button")
        dRank.className = "button blue flat no-cap"
        dRank.innerText = `Rank: #${userData.rank.toLocaleString()}`
        container.appendChild(dRank)
    
        const dSpecials = document.createElement("button")
        dSpecials.className = "button red flat no-cap"
        dSpecials.innerText = `Specials: ${userData.items.specials.toLocaleString()}`
        container.appendChild(dSpecials)
    
        const dHoards = document.createElement("button")
        dHoards.className = "button blue flat no-cap"
        dHoards.innerText = `Hoards: ${userData.items.hoards.toLocaleString()}`
        container.appendChild(dHoards)
    
        for (let i = 0; i < 2; i++) {
            contentDiv.appendChild(document.createElement("br"))
        }
    
        const aDetails = document.createElement("a")
        aDetails.href = "https://wwww.bhvalues.com/user/" + userId
        aDetails.innerText = "View more with "
        contentDiv.appendChild(aDetails)
    
        const aBHV = document.createElement("a")
        aBHV.href = "https://wwww.bhvalues.com/user/" + userId
        aBHV.style = "color: cornflowerblue"
        aBHV.innerText = "Brick Hill Values"
        contentDiv.appendChild(aBHV)
    }

    return mainDiv
}

async function getAssetURL(id) {
    const polyApi = "https://api.brick-hill.com/v1/assets/getPoly/1/"
    const assetApi = "https://api.brick-hill.com/v1/assets/get/"

    const res = await fetch(polyApi + id)
    const data = await res.json()
    const d1 = data[0]

    switch (d1.type) {
        case "hat": {
            const textureId = d1.texture.replace("asset://", "")
            const meshId  = d1.mesh.replace("asset://", "")
            const texture = await fetch(assetApi + textureId)
            const mesh = await fetch(assetApi + meshId)

            return [ texture, mesh, id ]
        }
        case "tool": {
            const textureId = d1.texture.replace("asset://", "")
            const meshId  = d1.mesh.replace("asset://", "")
            const texture = await fetch(assetApi + textureId)
            const mesh = await fetch(assetApi + meshId)

            return [ texture, mesh ]
        }
        case "head": {
            const meshId  = d1.mesh.replace("asset://", "")
            const mesh = await fetch(assetApi + meshId)

            return [ null, mesh, (id === 4859) ]
        }
        default: {
            if (!d1.type)
                return [ null, null ]
            const textureId  = d1.texture.replace("asset://", "")
            const texture = await fetch(assetApi + textureId)

            return [ texture, null ]
        }
    }

}

async function getUserAssets(id) {
    const res  = await fetch(api + id)
    const data = await res.json()
    const userData = {}

    userData.colors = {}
    for (c of Object.keys(data.colors))
        userData.colors[c] = "#" + data.colors[c]

    userData.hats = []
    userData.head = []

    for (hat of data.items.hats) {
        if (!hat) continue
        userData.hats.push( await getAssetURL(hat) )
    }

    if (data.items.head)
        userData.head = await getAssetURL(data.items.head)
    if (data.items.shirt)
        userData.shirt = await getAssetURL(data.items.shirt)
    if (data.items.pants)
        userData.pants = await getAssetURL(data.items.pants)
    if (data.items.tshirt)
        userData.tshirt = await getAssetURL(data.items.tshirt)
    if (data.items.face)
        userData.face = await getAssetURL(data.items.face)
    if (data.items.tool)
        userData.tool = await getAssetURL(data.items.tool)

    return userData
}

// Checking for friends because it was weirdly messing up the formatting of the page
if (userId && !window.location.href.includes("friends")) {

    if (userId == 127118) {
        let username = document.getElementsByClassName("ellipsis")[3]
        username.innerHTML += "   <img src='https://images.emojiterra.com/twitter/512px/1f1e7-1f1e9.png' style='height:20px'>"
    }

    fetch(api + userId)
    .then(res => res.json())
    .then(data => {
        let mainDiv = document.getElementsByClassName("col-6-12")
        var second_div = mainDiv[0].getElementsByClassName('card')[0]
        let card = document.createElement("div")
        card.className = "card"

        generateUserInfo().then(div => {
            mainDiv[0].insertBefore(div, second_div.nextSibling)
        })

        // Wait for the HTML then append the clothing to the DOM
        appendItems(data.items).then(html => {
            if (html) {
                card.appendChild(html[0])
                card.appendChild(html[1])

                mainDiv[1].appendChild(card)
            }
        })
    })
}

$(document).ready(async () => {
    const userAssets = await getUserAssets(userId)

    const userContainer = document.querySelector("div.content.text-center.bold.medium-text.relative.ellipsis")
    const box3D = new THREE.Box3()
    const OBJLoader = new THREE.OBJLoader();

    const scene = new THREE.Scene()
    const light = new THREE.HemisphereLight(0xFFFFFF, 0xB1B1B1, 1);
    scene.add(light);

    const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    camera.position.set( -2.97, 5.085, 4.52 );

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize( 325, 327 );
    $(renderer.domElement).css({
        "margin-right": "auto",
        "margin-left": "auto"
    })
    $(renderer.domElement).hide()

    const view3D = document.createElement("button")
	view3D.classList = "button medium green"
    $(view3D).css({
        "position": "absolute",
        "bottom": "125px",
        "right": "10px"
    })
	view3D.innerText = "3D"

    const userDescription = document.querySelector("div.user-description-box")

    userContainer.insertBefore(renderer.domElement, userDescription)
    userContainer.insertBefore(view3D, userDescription)
    for (let i = 0; i < 3; ++i) {
        userContainer.insertBefore(document.createElement("br"), userDescription)
    }

    // Finding the user thumbnail
    let imgs = $(userContainer).find('img')
    let userThumbnail = imgs.toArray().find(i => i.src.includes("brkcdn"))

    $(view3D).click(() => {
        const btt  = $(view3D)
        const text = btt.text()

        if (text.includes("3D")) {
            $(renderer.domElement).show()

            btt.text("2D")
            btt.removeClass("green")
            btt.addClass("blue")

            $(userThumbnail).hide()

            return
        }

        $(renderer.domElement).hide()

        btt.text("3D")
        btt.removeClass("blue")
        btt.addClass("green")

        $(userThumbnail).show()

        return
    })

    const TextureLoader = new THREE.TextureLoader();
    const MTLLoader = new THREE.MTLLoader()

    const headColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.head      })
    const torsoColor = new THREE.MeshPhongMaterial({ color: userAssets.colors.torso     })
    const rArmColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.right_arm })
    const lArmColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.left_arm  })
    const rLegColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.right_leg })
    const lLegColor  = new THREE.MeshPhongMaterial({ color: userAssets.colors.left_leg  })

    
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
                                if (userAssets.head[2]) {
                                    child.visible = false
                                    break
                                }

                                const faceMat = TextureLoader.load((userAssets.face) ? userAssets.face[0].url : "http://brkcdn.com/assets/default/face.png")

                                child.material = new THREE.MeshPhongMaterial({
                                    map: faceMat,
                                    transparent: true,
                                    opacity: (userAssets.head[1]) ? 0 : 1  // If user is wearing a head, hide the default one
                                })
                               
                                
                                if (userAssets.head[1]) {
                                    OBJLoader.load(
                                        userAssets.head[1].url,
                                        object => {
                                            object.traverse(child => {
                                                child.material = new THREE.MeshPhongMaterial({
                                                    map: faceMat,
                                                    transparent: true,
                                                    opacity: 1
                                                })
                                            })
                                
                                            scene.add( object );
                                
                                        }, xhr => {},  err => {}
                                    )
                                } else {
                                    const bodyColor = child.clone()
                                    bodyColor.material = headColor
                                    scene.add(bodyColor)
                                }

                                break
                            }
                            case "Left_Arm_Left_Arm_Left_Arm_Cube_Left_Arm_Cube.000": {

                                if (userAssets.shirt) {
                                    const shirtMat = TextureLoader.load(userAssets.shirt[0].url)

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

                                if (userAssets.pants) {
                                    const pantsMat = TextureLoader.load(userAssets.pants[0].url)

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

                                if (userAssets.shirt) {
                                    const shirtMat = TextureLoader.load(userAssets.shirt[0].url)

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

                                    if (userAssets.tool) {
                                        studs.rotation.x = -Math.PI / 2
                                        studs.position.y = studs.position.z = 3.5
                                    }
                                }
                                
                                let bodyColor = child.clone()
                                bodyColor.material = rArmColor
                                bodyColor.renderOrder = 2
                                scene.add(bodyColor)

                                if (userAssets.tool) {
                                    bodyColor.rotation.x = child.rotation.x = -Math.PI / 2;
                                    bodyColor.position.y = bodyColor.position.z =  child.position.y = child.position.z = 3.5
                                }

                                break
                            }
                            case "Right_Leg_Right_Leg_Right_Leg_Left_Arm_Cube.006": {
                                if (userAssets.pants) {
                                    const pantsMat = TextureLoader.load(userAssets.pants[0].url)

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

                                if (userAssets.pants) {
                                    if (userAssets.shirt) {
                                        const shirtMat = TextureLoader.load(userAssets.shirt[0].url)

                                        child.material = new THREE.MeshPhongMaterial({
                                            map: shirtMat,
                                            transparent: true,
                                            opacity: 1
                                        })

                                        child.renderOrder = 3

                                        const pantsMat = TextureLoader.load(userAssets.pants[0].url)
                                        const pants = child.clone()

                                        pants.material = new THREE.MeshPhongMaterial({
                                            map: pantsMat,
                                            transparent: true,
                                            opacity: 1
                                        })
                                        pants.renderOrder = 2

                                    } else {
                                        const pantsMat = TextureLoader.load(userAssets.pants[0].url)
                                        child.material = new THREE.MeshPhongMaterial({
                                            map: pantsMat,
                                            transparent: true,
                                            opacity: 1
                                        })
                                    }

                                } else if (userAssets.shirt) {
                                    const shirtMat = TextureLoader.load(userAssets.shirt[0].url)

                                    child.material = new THREE.MeshPhongMaterial({
                                        map: shirtMat,
                                        transparent: true,
                                        opacity: 1
                                    })

                                } else 
                                    child.material = torsoColor

                                child.renderOrder = 1
                                
                                let bodyColor = child.clone()
                                bodyColor.material = torsoColor
                                scene.add(bodyColor)
                                bodyColor.renderOrder = 1

                                // Render the t-shirt here with the torso
                                if (userAssets.tshirt) {
                                    const geometry = new THREE.PlaneGeometry( 2, 1.9, 1 );
                                    const tShirtMat = TextureLoader.load(userAssets.tshirt[0].url)
                                    const material = new THREE.MeshBasicMaterial({
                                        map: tShirtMat,
                                        transparent: true
                                    });
                                    const plane = new THREE.Mesh( geometry, material );
                                    plane.renderOrder = 2
                                    scene.add( plane );

                                    plane.position.y = 3 
                                    plane.position.z = 0.5001
                                }

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


    if (userAssets.head[1] && !userAssets.head[2]) {
        OBJLoader.load(
            userAssets.head[1].url,
            object => {
                object.traverse(child => {
                    child.material = new THREE.MeshPhongMaterial({
                        color: userAssets.colors.head
                    })
                })
    
                scene.add( object );
    
            },
            xhr => {},
            err => {}
        )
    }

    if (userAssets.tool) {
        OBJLoader.load(
            userAssets.tool[1].url,
            object => {
                object.traverse(child => {
                    child.material = new THREE.MeshPhongMaterial({
                        map: TextureLoader.load(userAssets.tool[0].url)
                    })
                })
    
                scene.add( object );
    
            },
            xhr => {},
            err => {}
        )
    }

    for (hat of userAssets.hats) {
        const texture = hat[0].url
        const obj = hat[1].url
        OBJLoader.load(
            obj,
            object => {
                object.traverse(child => {
                    child.material = new THREE.MeshPhongMaterial({
                        map: TextureLoader.load(texture)
                    })
                })
    
                scene.add( object );
    
            },
            xhr => {},
            err => {}
        )
    }

    var controls = new THREE.OrbitControls( camera, userContainer );
    //controls.autoRotate = true;
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
})