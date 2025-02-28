class Block {
    constructor(scene, position, size = { width: 3, height: 3, depth: 3 }, color = 0x8B4513) {
        this.position = position;
        this.size = size;
        
        // Create the block mesh
        const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.7,
            metalness: 0.2
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.position.y += size.height / 2; // Place on ground
        
        // Set shadows
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add to scene
        scene.add(this.mesh);
        
        // Create collision box
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }
    
    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
        return this.boundingBox;
    }
    
    checkCollision(otherBox) {
        return this.boundingBox.intersectsBox(otherBox);
    }
}
