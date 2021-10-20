const avatarApi = "https://api.brick-hill.com/v1/games/retrieveAvatar?id="

async function getAssetURL(id) {

    const polyApi = "https://api.brick-hill.com/v1/assets/getPoly/1/"
    const assetApi = "https://api.brick-hill.com/v1/assets/get/"

    const res = await fetch(polyApi + id, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    })
    data = await res.json()

    if (data.error)
        return null
    data = data[0]

    console.log(data)

    switch (data.type) {
        case "hat": {
            const textureId = data.texture.replace("asset://", "")
            const meshId  = data.mesh.replace("asset://", "")
            const texture = await fetch(assetApi + textureId)
            const mesh = await fetch(assetApi + meshId)

            const item = {
                texture: texture.url,
                mesh:    mesh.url,
                type:    data.type,
                id:      id,
            }

            return item
        }
        case "tool": {
            const textureId = data.texture.replace("asset://", "")
            const meshId  = data.mesh.replace("asset://", "")
            const texture = await fetch(assetApi + textureId)
            const mesh = await fetch(assetApi + meshId)

            const item = {
                texture: texture.url,
                mesh:    mesh.url,
                type:    data.type,
                id:      id,
            }

            return item
        }
        case "head": {
            const meshId  = data.mesh.replace("asset://", "")
            const textureId = data.texture?.replace("asset://", "")
            const mesh = await fetch(assetApi + meshId)
            const texture = await fetch(assetApi + textureId)

            const item = {
                // this is such an awful fix
                texture:   (texture.url.includes("undefined")) ? null : texture.url,
                mesh:      mesh.url,
                type:      data.type,
                id:        id
            }

            return item
        }
        default: {
            if (!data.type)
                return null
            const textureId  = data.texture.replace("asset://", "")
            const texture = await fetch(assetApi + textureId)

            const item = {
                texture: texture.url,
                mesh:    null,
                type:    data.type,
                id:      id,
            }

            return item
        }
    }
}

async function getUserAssets(id) {
    const res  = await fetch(avatarApi + id)
    const data = await res.json()
    let userData = {
        colors: {},
        hats:   [],
        head:   {},
    }

    for (let c of Object.keys(data.colors))
        userData.colors[c] = "#" + data.colors[c]

    for (let hat of data.items.hats) {
        if (!hat) continue
        userData.hats.push( await getAssetURL(hat) )
    }

    if (data.items.head)
        userData.head   = await getAssetURL(data.items.head)
    if (data.items.shirt)
        userData.shirt  = await getAssetURL(data.items.shirt)
    if (data.items.pants)
        userData.pants  = await getAssetURL(data.items.pants)
    if (data.items.tshirt)
        userData.tshirt = await getAssetURL(data.items.tshirt)
    if (data.items.face)
        userData.face   = await getAssetURL(data.items.face)
    if (data.items.tool)
        userData.tool   = await getAssetURL(data.items.tool)

    return userData
}
