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
    },

    // Navbar settings
    "n_CustomButton": {
        default: {
            name: "",
            link: ""
        },
        null: {
            name: "",
            link: ""    
        }
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

    addProp: (key, val) => {
        const data = storage.get(key)
        if (!data)
            return null
        let newData = {
            ...data,
            ...val
        }
        storage.set(key, newData)
    },

    // Checks to see if the settings includes all the properties
    // Return false if a property is missing
    checkProps: key => {
        const data = storage.get(key)
        if (!data)
            return false

        const currentProps = Object.keys(data)
        const neededProps  = Object.keys(storageKeys)

        return neededProps.every(prop => currentProps.includes(prop)) && currentProps.every(prop => neededProps.includes(prop))
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

        // Remove any keys that aren't supposed to be there
        let badKeys = keys.filter(k => !Object.keys(storageKeys).includes(k))
        for (let badKey of badKeys)
            delete data[badKey]

        return storage.set(key, data)
    },

    nullProps: key => {
        fillProps(key, true)
    }
}