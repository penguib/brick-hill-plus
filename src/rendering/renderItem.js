async function renderItem(itemID, container) {
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

    const texture = new THREE.TextureLoader();
    const mapOverlay = texture.load(itemData.texture);
    const material = new THREE.MeshPhongMaterial({
        map: mapOverlay,
        side: THREE.DoubleSide
    });

    parseOBJ(itemData.mesh, parsed => {
        let model = OBJloader.parse(parsed)
        model.traverse(child => {
            child.material = material
        })

        box3D.setFromObject(model);
        box3D.center(controls.target);
        scene.add(model)
    })

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