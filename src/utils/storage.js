const storageKeys = {

    // Forum settings
    "f_ImageEmbeds": {
        default: true,
        null: false
    },

    "f_Badges": {
        default: true,
        null: false
    },

    "f_Signature": {
        default: "",
        null: ""
    }, 

    "f_PPD": {
        default: true,
        null: false
    },


    // Message settings
    "m_ImageEmbeds": {
        default: true,
        null: false
    }, 

    // Shop settings
    "s_Conversions": {
        default: 0.0099,
        null: 0
    },
    "s_A3D": {
        default: true,
        null: false
    },
    "s_I3D": {
        default: true,
        null: false
    }
} 


const storage = {
    get: key => {
        const data = window.localStorage.getItem(key)
        if (!data)
            return null
        const decompressed = LZString.decompress(data)
        return JSON.parse(decompressed)
    },

    set: (key, val) => {
        const compressed = LZString.compress( JSON.stringify(val) )
        window.localStorage.setItem(key, compressed)
    },

    // Checks to see if the settings includes all the properties
    // Return false if a property is missing
    checkProps: key => {
        const data = storage.get(key)
        if (!data)
            return false
        const props = Object.keys(data)
        return props.every(prop => Object.keys(storageKeys).includes(prop))
    },

    fillProps: (key, nulled = false) => {
        const data = storage.get(key)
        if (!data) {
            const newData = {}
            for (let prop of Object.keys(storageKeys)) {
                if (!nulled) {
                    newData[prop] = storageKeys[prop].default
                    continue
                }
                newData[prop] = storageKeys[prop].null
            } 

            return storage.set(key, newData)
        }
        
        const keys = Object.keys(data)
        for (let prop of Object.keys(storageKeys)) {
            if (nulled) {
                data[prop] = storageKeys[prop].null
                continue
            }

            if (keys.includes(prop))
                continue
            data[prop] = storageKeys[prop].default
        }
    },

    nullProps: key => {
        fillProps(key)
    }
}