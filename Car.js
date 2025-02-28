class Car {
    constructor(scene, camera, initialPosition = new THREE.Vector3(0, 1, 0)) {  // Changed initial Y position to 1
        this.carGroup = new THREE.Group();
        this.carGroup.position.copy(initialPosition);

        // Create main body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1e90ff });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 0.5;
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.carGroup.add(this.body);
        
        // Store previous position for collision response
        this.previousPosition = new THREE.Vector3();

        // Create roof
        const roofGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x1e90ff });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.4;
        roof.castShadow = true;
        roof.receiveShadow = true;
        this.carGroup.add(roof);

        // Create windows (black material)
        const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
        
        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(1.7, 0.7, 0.1);
        const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
        windshield.position.set(0, 1.2, 0.8);
        windshield.rotation.x = Math.PI * 0.1;
        windshield.castShadow = true;
        windshield.receiveShadow = true;
        this.carGroup.add(windshield);

        // Rear window
        const rearWindow = new THREE.Mesh(windshieldGeometry, windowMaterial);
        rearWindow.position.set(0, 1.2, -0.8);
        rearWindow.rotation.x = -Math.PI * 0.1;
        rearWindow.castShadow = true;
        rearWindow.receiveShadow = true;
        this.carGroup.add(rearWindow);

        // Create lights
        const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const rearLightMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

        // Front lights
        const frontLightGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const frontLightLeft = new THREE.Mesh(frontLightGeometry, lightMaterial);
        frontLightLeft.position.set(-0.8, 0.5, 2);
        frontLightLeft.castShadow = true;
        const frontLightRight = new THREE.Mesh(frontLightGeometry, lightMaterial);
        frontLightRight.position.set(0.8, 0.5, 2);
        frontLightRight.castShadow = true;
        this.carGroup.add(frontLightLeft, frontLightRight);

        // Rear lights
        const rearLightGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const rearLightLeft = new THREE.Mesh(rearLightGeometry, rearLightMaterial);
        rearLightLeft.position.set(-0.8, 0.5, -2);
        rearLightLeft.castShadow = true;
        const rearLightRight = new THREE.Mesh(rearLightGeometry, rearLightMaterial);
        rearLightRight.position.set(0.8, 0.5, -2);
        rearLightRight.castShadow = true;
        this.carGroup.add(rearLightLeft, rearLightRight);

        // Create wheels with rims
        this.wheels = [];
        const wheelRadius = 0.4;
        const wheelThickness = 0.3;

        const wheelPositions = [
            [-0.9, wheelRadius - 0.4, 1.2],  // Front Left, lower position
            [0.9, wheelRadius - 0.4, 1.2],   // Front Right, lower position
            [-0.9, wheelRadius - 0.4, -1.2], // Back Left, lower position
            [0.9, wheelRadius - 0.4, -1.2]   // Back Right, lower position
        ];

        wheelPositions.forEach(pos => {
            const wheelGroup = new THREE.Group();
            
            // Tire
            const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 24);
            const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            
            // Rim
            const rimGeometry = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelThickness + 0.01, 8);
            const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            
            wheel.rotation.z = Math.PI / 2;
            rim.rotation.z = Math.PI / 2;
            
            wheel.castShadow = true;
            wheel.receiveShadow = true;
            rim.castShadow = true;
            rim.receiveShadow = true;
            
            wheelGroup.add(wheel, rim);
            wheelGroup.position.set(pos[0], pos[1], pos[2]);
            
            this.carGroup.add(wheelGroup);
            this.wheels.push(wheelGroup);
        });

        // Add car to scene
        scene.add(this.carGroup);

        // Car properties
        this.velocity = new THREE.Vector3();
        this.speed = 0;
        this.maxSpeed = 30;
        this.acceleration = 20;
        this.deceleration = 10;
        this.turnSpeed = 2;
        this.wheelRotationSpeed = 0;

        // Camera setup
        this.camera = camera;
        this.cameraOffset = new THREE.Vector3(0, 5, -10);
        this.firstPersonOffset = new THREE.Vector3(0, 1.8, 0.5);
        this.isFirstPerson = false;
        scene.add(camera);

        // Create collision box
        const collisionGeometry = new THREE.BoxGeometry(2.2, 1.8, 4.2); // Slightly larger than car
        this.collisionBox = new THREE.Box3();
        
        // Debug collision box (uncomment to see collision box)
        // const collisionMesh = new THREE.Mesh(
        //     collisionGeometry,
        //     new THREE.MeshBasicMaterial({ wireframe: true, color: 0xff0000 })
        // );
        // this.carGroup.add(collisionMesh);
        
        this.collisionDirection = new THREE.Vector3();
        this.isColliding = false;
        this.collisionCooldown = 0;

        // Add nitro properties
        this.nitroParticles = [];
        this.nitroActive = false;
        this.nitroFuel = 100;
        this.maxNitroFuel = 100;
        this.nitroRechargeRate = 20; // Fuel per second
        this.nitroConsumptionRate = 40; // Fuel per second
        this.nitroSpeedBoost = 1.8; // Speed multiplier when nitro is active

        // Create more nitro particles
        for (let i = 0; i < 40; i++) { // Increased from 20 to 40 particles
            const particle = this.createNitroParticle();
            this.nitroParticles.push(particle);
            scene.add(particle);
        }
    }

    createNitroParticle() {
        const size = Math.random() * 0.2 + 0.1; // Varied particle sizes
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.6, 1, 0.5), // More vibrant blue color
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.visible = false;
        return particle;
    }

    updateNitroParticles(deltaTime) {
        if (!this.nitroActive || this.speed < 0) {
            this.nitroParticles.forEach(p => p.visible = false);
            return;
        }

        const exhaustPositions = [
            new THREE.Vector3(-0.8, 0.5, -2), // Left exhaust
            new THREE.Vector3(0.8, 0.5, -2)   // Right exhaust
        ];

        this.nitroParticles.forEach((particle, i) => {
            if (!particle.userData.active) {
                // Initialize particle
                const exhaustPos = exhaustPositions[i % 2];
                particle.position.copy(exhaustPos);
                particle.position.applyMatrix4(this.carGroup.matrix);
                
                // Add random spread
                particle.position.x += (Math.random() - 0.5) * 0.5;
                particle.position.y += (Math.random() - 0.5) * 0.5;
                
                particle.userData.active = true;
                particle.userData.life = 1.0;
                particle.userData.speed = Math.random() * 5 + 10; // Varied particle speeds
                particle.visible = true;
                particle.scale.set(1, 1, 1);
                
                // Random color variation
                const hue = Math.random() * 0.1 + 0.6; // Blue to purple range
                const brightness = Math.random() * 0.5 + 0.5;
                particle.material.color.setHSL(hue, 1, brightness);
                particle.material.opacity = 1;
            }

            // Update particle
            particle.userData.life -= deltaTime * 2;
            
            // More dramatic particle movement
            const moveDir = new THREE.Vector3(
                (Math.random() - 0.5) * 2, // Add random horizontal spread
                (Math.random() - 0.5) * 2 - 1, // Add random vertical spread
                -1
            ).applyEuler(this.carGroup.rotation)
                .multiplyScalar(deltaTime * particle.userData.speed);
            
            particle.position.add(moveDir);

            // Update particle appearance
            const life = particle.userData.life;
            particle.material.opacity = life;
            
            // Dramatic scaling effect
            const scale = (1 - life) * 2 + 0.5;
            particle.scale.set(scale, scale, scale);

            // Color transition effect
            const hue = 0.6 + (1 - life) * 0.1; // Transition from blue to purple
            const brightness = life * 0.5 + 0.5;
            particle.material.color.setHSL(hue, 1, brightness);

            // Reset particle if lifetime ended
            if (life <= 0) {
                particle.userData.active = false;
            }
        });
    }

    toggleView() {
        this.isFirstPerson = !this.isFirstPerson;
    }

    updateCollisionBox() {
        // Update collision box to match car position and rotation
        this.collisionBox.setFromObject(this.body);
        return this.collisionBox;
    }

    update(deltaTime) {
        // Update nitro state
        if (controlState.boost && this.nitroFuel > 0 && this.speed > 0) {
            this.nitroActive = true;
            this.nitroFuel = Math.max(0, this.nitroFuel - this.nitroConsumptionRate * deltaTime);
        } else {
            this.nitroActive = false;
            this.nitroFuel = Math.min(this.maxNitroFuel, this.nitroFuel + this.nitroRechargeRate * deltaTime);
        }

        // Apply nitro speed boost
        const speedMultiplier = this.nitroActive ? this.nitroSpeedBoost : 1;

        // Update collision cooldown
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= deltaTime;
        }
        
        // Reset collision flag
        this.isColliding = false;
        
        // Store previous position for collision response
        this.previousPosition.copy(this.carGroup.position);

        // Handle acceleration
        if (controlState.moveForward) {
            this.speed = Math.min(this.speed + this.acceleration * deltaTime, this.maxSpeed * speedMultiplier);
        } else if (controlState.moveBackward) {
            this.speed = Math.max(this.speed - this.acceleration * deltaTime, -this.maxSpeed / 2);
        } else {
            // Apply deceleration when no input
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.deceleration * deltaTime);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.deceleration * deltaTime);
            }
        }

        // Handle turning
        if (this.speed !== 0) {
            if (controlState.moveLeft) {
                this.carGroup.rotation.y += this.turnSpeed * deltaTime * (this.speed > 0 ? 1 : -1);
            }
            if (controlState.moveRight) {
                this.carGroup.rotation.y -= this.turnSpeed * deltaTime * (this.speed > 0 ? 1 : -1);
            }
        }

        // Update position
        const direction = new THREE.Vector3(0, 0, 1).applyEuler(this.carGroup.rotation);
        this.carGroup.position.addScaledVector(direction, this.speed * deltaTime);

        // Rotate wheels
        this.wheelRotationSpeed = this.speed * 2;
        this.wheels.forEach(wheel => {
            wheel.children.forEach(part => {
                part.rotation.x += this.wheelRotationSpeed * deltaTime;
            });
        });

        // Update camera position based on view mode
        const cameraTarget = this.carGroup.position.clone();
        
        if (this.isFirstPerson) {
            // First-person view
            const fpPosition = this.carGroup.position.clone()
                .add(this.firstPersonOffset.clone().applyEuler(new THREE.Euler(0, this.carGroup.rotation.y, 0)));
            this.camera.position.copy(fpPosition);
            
            // Look in the direction of car's forward
            cameraTarget.add(new THREE.Vector3(0, 1.8, 10).applyEuler(new THREE.Euler(0, this.carGroup.rotation.y, 0)));
        } else {
            // Third-person view
            const cameraPosition = this.carGroup.position.clone()
                .add(this.cameraOffset.clone().applyEuler(new THREE.Euler(0, this.carGroup.rotation.y, 0)));
            this.camera.position.copy(cameraPosition);
        }
        
        this.camera.lookAt(cameraTarget);

        // Constrain to world bounds
        this.constrainToWorldBounds();

        // Add some "recovery" steering when colliding
        if (this.isColliding) {
            this.speed *= 0.95; // Additional speed reduction during collision
            
            // Add slight automatic steering correction
            if (this.speed !== 0) {
                const correction = 0.5 * deltaTime * Math.sign(this.speed);
                this.carGroup.rotation.y += this.collisionDirection.x * correction;
            }
        }

        // Update nitro particles
        this.updateNitroParticles(deltaTime);
    }

    // Method to be called after collision is detected
    handleCollision(block) {
        if (this.collisionCooldown > 0) return;
        
        // Calculate collision normal
        const carCenter = new THREE.Vector3();
        this.collisionBox.getCenter(carCenter);
        
        const blockCenter = new THREE.Vector3();
        block.boundingBox.getCenter(blockCenter);
        
        this.collisionDirection.subVectors(carCenter, blockCenter).normalize();
        
        // Maintain Y position during collision
        const originalY = this.carGroup.position.y;
        
        // Move car away from collision (only in X and Z directions)
        const pushDistance = 0.3;
        const pushVector = new THREE.Vector3(
            this.collisionDirection.x,
            0, // Don't push in Y direction
            this.collisionDirection.z
        ).normalize().multiplyScalar(pushDistance);
        
        this.carGroup.position.add(pushVector);
        
        // Restore Y position
        this.carGroup.position.y = originalY;
        
        // Reduce speed based on collision angle
        const impactAngle = Math.abs(this.collisionDirection.dot(new THREE.Vector3(0, 0, 1).applyEuler(this.carGroup.rotation)));
        this.speed *= (1 - impactAngle) * 0.5;
        
        // Add some rotation based on collision point
        const rotationImpact = (1 - impactAngle) * 0.5;
        this.carGroup.rotation.y += (Math.random() - 0.5) * rotationImpact;
        
        // Set collision cooldown
        this.collisionCooldown = 0.1;
        this.isColliding = true;
    }

    constrainToWorldBounds() {
        const halfWorldSize = WORLD_SIZE / 2;
        const minHeight = 0.4; // Minimum height for the car
        
        this.carGroup.position.x = Math.max(-halfWorldSize, Math.min(halfWorldSize, this.carGroup.position.x));
        this.carGroup.position.z = Math.max(-halfWorldSize, Math.min(halfWorldSize, this.carGroup.position.z));
        this.carGroup.position.y = Math.max(minHeight, this.carGroup.position.y);
    }

    getPosition() {
        return this.carGroup.position;
    }
}
