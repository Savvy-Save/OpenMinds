// Ensure Three.js is loaded before this script
if (typeof THREE === 'undefined') {
    console.error('Three.js has not been loaded. Please include it before this script.');
} else {
    let scene, camera, renderer, cube;
    let cubeContainer;

    function init() {
        // Get the container element
        cubeContainer = document.getElementById('cube-container');
        if (!cubeContainer) {
            console.error('The div with id "cube-container" was not found.');
            return;
        }

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0); // Light gray background

        // Camera
        camera = new THREE.PerspectiveCamera(75, cubeContainer.clientWidth / cubeContainer.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(cubeContainer.clientWidth, cubeContainer.clientHeight);
        cubeContainer.appendChild(renderer.domElement);

        // Cube
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0x007bff }); // Blue color
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

        // Mouse interaction for rotation
        let isDragging = false;
        let previousMousePosition = {
            x: 0,
            y: 0
        };

        cubeContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        cubeContainer.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.clientX - previousMousePosition.x,
                    y: e.clientY - previousMousePosition.y
                };

                const deltaRotationQuaternion = new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(
                        toRadians(deltaMove.y * 0.5),
                        toRadians(deltaMove.x * 0.5),
                        0,
                        'XYZ'
                    ));

                cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        cubeContainer.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        cubeContainer.addEventListener('mouseleave', () => { // Stop dragging if mouse leaves container
            isDragging = false;
        });


        // Initial render
        animate();
    }

    function onWindowResize() {
        if (cubeContainer && camera && renderer) {
            camera.aspect = cubeContainer.clientWidth / cubeContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(cubeContainer.clientWidth, cubeContainer.clientHeight);
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        // cube.rotation.x += 0.005; // Auto-rotation (optional)
        // cube.rotation.y += 0.005; // Auto-rotation (optional)
        renderer.render(scene, camera);
    }

    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Wait for the DOM to be fully loaded before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOMContentLoaded has already fired
        init();
    }
}
