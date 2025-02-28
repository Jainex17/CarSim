class Cloud {
    constructor(scene, position = new THREE.Vector3()) {
        // Create cloud material with low opacity
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });

        // Create cloud group
        this.cloudGroup = new THREE.Group();
        
        // Create minecraft-style blocky cloud using cubes
        const blockSize = 2;
        const cloudPattern = [
            // Bottom layer - wider pattern
            [[0,0,0], [1,0,0], [-1,0,0], [0,0,1], [0,0,-1], [2,0,0], [-2,0,0]],
            // Top layer - smaller pattern
            [[0,1,0], [1,1,0], [-1,1,0], [0,1,1]]
        ];

        // Create blocks based on pattern
        cloudPattern.forEach(layer => {
            layer.forEach(([x, y, z]) => {
                const blockGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
                const block = new THREE.Mesh(blockGeometry, cloudMaterial);
                block.position.set(
                    x * blockSize,
                    y * blockSize,
                    z * blockSize
                );
                this.cloudGroup.add(block);
            });
        });

        // Set initial position
        this.cloudGroup.position.copy(position);
        
        // Add to scene
        scene.add(this.cloudGroup);
        
        // Movement properties
        this.speed = 0.3 + Math.random() * 0.2;
        this.direction = new THREE.Vector3(1, 0, 0);
    }

    update(deltaTime) {
        // Move cloud
        this.cloudGroup.position.x += this.direction.x * this.speed * deltaTime;
        
        // If cloud goes beyond world bounds, reset position
        if (this.cloudGroup.position.x > WORLD_SIZE / 2) {
            this.cloudGroup.position.x = -WORLD_SIZE / 2;
        }
    }
}
