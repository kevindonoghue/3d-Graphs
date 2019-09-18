let font;
// wait until fonts are loaded before rendering scene
const manager = new THREE.LoadingManager();
manager.onLoad = () => {
    if (document.getElementById('c').active) {
    init();
    animate();
    }
};
// font prep for displaying the labels on the axes
let loader = new THREE.FontLoader(manager);
loader.load("fonts/helvetiker_regular.typeface.json", response => {
    font = response;
});  