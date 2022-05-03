import {
    AmbientLight,
    AxesHelper,
    DirectionalLight,
    GridHelper,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Raycaster,
    Vector2,
    MeshLambertMaterial
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import {
    acceleratedRaycast,
    computeBoundsTree,
    disposeBoundsTree
} from 'three-mesh-bvh';

import {
    IFCWALLSTANDARDCASE,
    IFCSLAB,
    IFCFURNISHINGELEMENT,
    IFCDOOR,
    IFCWINDOW,
    IFCPLATE,
    IFCMEMBER
} from 'web-ifc';



//Creates the Three.js scene
const scene = new Scene();

//Object to store the size of the viewport
const size = {
    width: window.innerWidth,
    height: window.innerHeight,
};

//Creates the camera (point of view of the user)
const aspect = size.width / size.height;
const camera = new PerspectiveCamera(75, aspect);
camera.position.z = 15;
camera.position.y = 13;
camera.position.x = 8;

//Creates the lights of the scene
const lightColor = 0xffffff;

const ambientLight = new AmbientLight(lightColor, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(lightColor, 1);
directionalLight.position.set(0, 10, 0);
directionalLight.target.position.set(-5, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

//Sets up the renderer, fetching the canvas of the HTML
const threeCanvas = document.getElementById("three-canvas");
const renderer = new WebGLRenderer({
    canvas: threeCanvas,
    alpha: true
});

renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Creates grids and axes in the scene
const grid = new GridHelper(50, 30);
scene.add(grid);

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes);

//Creates the orbit controls (to navigate the scene)
const controls = new OrbitControls(camera, threeCanvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

//Animation loop
const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();

//Adjust the viewport to the size of the browser
window.addEventListener(
    "resize",
    () => {
        size.width = window.innerWidth;
        size.height = window.innerHeight;
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        renderer.setSize(size.width, size.height);
    }
);


// Sets up the IFC loading
const ifcModels = [];
const ifcLoader = new IFCLoader();

const input = document.getElementById("file-input");
input.addEventListener(
    "change",
    (changed) => {
        const file = changed.target.files[0];
        var ifcURL = URL.createObjectURL(file);
        ifcLoader.load(
            ifcURL,
            async (ifcModel) => {
                ifcModels.push(ifcModel);
                //scene.add(ifcModel);
                await setupAllCategories();
            }
        );
    },
    false
);

const ifc = ifcLoader.ifcManager;

// Sets up optimized picking
ifc.setupThreeMeshBVH(
    computeBoundsTree,
    disposeBoundsTree,
    acceleratedRaycast
);

const raycaster = new Raycaster();
raycaster.firstHitOnly = true;
const mouse = new Vector2();

function cast(event) {

    // Computes the position of the mouse on the screen
    const bounds = threeCanvas.getBoundingClientRect();

    const x1 = event.clientX - bounds.left;
    const x2 = bounds.right - bounds.left;
    mouse.x = (x1 / x2) * 2 - 1;

    const y1 = event.clientY - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = -(y1 / y2) * 2 + 1;

    // Places it on the camera pointing to the mouse
    raycaster.setFromCamera(mouse, camera);

    // Casts a ray
    return raycaster.intersectObjects(ifcModels);
}

const idOutput = document.getElementById("id-output");
const propsOutput = document.getElementById("props-output");

async function pick(event) {
    const found = cast(event)[0];
    if (found) {
        const index = found.faceIndex;
        const geometry = found.object.geometry;
        const id = ifc.getExpressId(geometry, index);
        // ID
        console.log(id);
        idOutput.innerHTML = id;
        // Properties
        const modelID = found.object.modelID;
        const props = await ifc.getItemProperties(modelID, id);
        propsOutput.innerHTML = JSON.stringify(props, null, 2);
        ifcURL.removeSubset(modelID);
    }
}

// Creates subset material
const preselectMat = new MeshLambertMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0xff88ff,
    depthTest: false
});

// Reference to the previous selection
let preselectModel = { id: -1 };

function highlight(event, material, model) {
    const found = cast(event)[0];
    if (found) {

        // Gets model ID
        model.id = found.object.modelID;

        // Gets Express ID
        const index = found.faceIndex;
        const geometry = found.object.geometry;
        const id = ifc.getExpressId(geometry, index);

        // Creates subset
        ifc.createSubset({
            modelID: model.id,
            ids: [id],
            material: material,
            scene: scene,
            removePrevious: true
        });
    } else {
        // Removes previous highlight
        ifc.removeSubset(model.id, material);
    }
}

threeCanvas.onmousemove = (event) => highlight(event, preselectMat, preselectModel);

const selectMat = new MeshLambertMaterial(
    {
        transparent: true,
        opacity: 0.6,
        color: 0x77aaff,
        depthTest: false
    }
);

const selectModel = { id: -1 };

threeCanvas.ondblclick = (event) => {
    pick(event);
    highlight(event, selectMat, selectModel);
}

// List of categories names
const categories = {
	IFCWALLSTANDARDCASE,
	IFCSLAB,
	IFCFURNISHINGELEMENT,
	IFCDOOR,
	IFCWINDOW,
	IFCPLATE,
	IFCMEMBER,
};

// Gets the name of a category
function getName(category) {
	const names = Object.keys(categories);
	return names.find(name => categories[name] === category);
}

// Gets all the items of a category
async function getAll(category) {
	return ifc.getAllItemsOfType(0, category, false);
}

// Creates a new subset containing all elements of a category
async function newSubsetOfType(category) {
	const ids = await getAll(category);
	return ifc.createSubset({
		modelID: 0,
		scene,
		ids,
		removePrevious: true,
		customID: category.toString(),
	});
}

// Stores the created subsets
const subsets = {};

async function setupAllCategories() {
	const allCategories = Object.values(categories);
	for (let i = 0; i < allCategories.length; i++) {
		const category = allCategories[i];
		await setupCategory(category);
	}
}

// Creates a new subset and configures the checkbox
async function setupCategory(category) {
	subsets[category] = await newSubsetOfType(category);
	setupCheckBox(category);
}

// Sets up the checkbox event to hide / show elements
function setupCheckBox(category) {
	const name = getName(category);
	const checkBox = document.getElementById(name);
	checkBox.addEventListener('change', (event) => {
		const checked = event.target.checked;
		const subset = subsets[category];
		if (checked) scene.add(subset);
		else subset.removeFromParent();
	});
}

// Loading file
async function setUpMultiThreading() {
    // These paths depend on how you structure your project
    await ifc.useWebWorkers(true, 'node_modules/web-ifc-three/IFCWorker.js');
    await ifc.setWasmPath('../../src/');
}

function setupProgressNotification() {
    const text = document.getElementById('progress-text');
    ifc.setOnProgress((event) => {
      const percent = event.loaded / event.total * 100;
        const result = Math.trunc(percent);
        text.innerText = result.toString();
    });
}

setUpMultiThreading();
setupProgressNotification();