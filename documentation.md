# 3D Driving Game Documentation

## Overview
This is a 3D driving game built with Three.js where players can drive a car around a large world with buildings and clouds.

## Game Features

### World
- Large world with dimensions of 400x400 units
- Grass-textured ground with grid pattern
- Dynamic sky with moving clouds
- Random buildings scattered throughout the world
- Day lighting system with shadows

### Car
- Detailed 3D car model with:
  - Main body and roof
  - Windshield and rear window
  - Front (white) and rear (red) lights
  - Wheels with rotating rims
  - Real-time wheel rotation
- Physics features:
  - Acceleration and deceleration
  - Turning mechanics
  - Collision detection and response
  - World boundary constraints
- Nitro system:
  - Boost capability with particle effects
  - Nitro fuel gauge (100% max)
  - Auto-recharging when not in use
  - Visual feedback through exhaust particles

### Camera System
- Switchable views:
  - Third-person view (default)
  - First-person view
- Dynamic camera following
- Smooth transitions

### Controls
- W/Up Arrow: Accelerate
- S/Down Arrow: Brake/Reverse
- A/Left Arrow: Turn left
- D/Right Arrow: Turn right
- V: Toggle camera view
- Shift: Activate nitro boost
- ESC: Pause game

### User Interface
- FPS counter
- Nitro fuel gauge
- Start screen with instructions
- Pause menu
- Fullscreen support

### Buildings
- Randomly generated buildings with:
  - Varying heights (15-40 units)
  - Different widths and depths
  - Unique colors
  - Collision detection

### Environmental Effects
- Dynamic cloud system:
  - Multiple clouds
  - Continuous movement
  - Minecraft-style blocky appearance
  - Semi-transparent rendering

### Technical Features
- Shadow mapping
- Collision detection system
- Performance optimization
- Responsive design
- Tab visibility handling
- Window resize handling

## Game States

### Start State
- Shows instruction screen
- Click to start
- Locks pointer for game control

### Playing State
- Full game functionality
- Real-time physics
- Collision detection
- Environmental updates

### Paused State
- Freezes game logic
- Shows pause menu
- Maintains scene rendering
- Can be triggered by:
  - ESC key
  - Tab unfocus
  - Manual pause

## Performance
- Optimized shadow calculations
- Efficient collision detection
- Frame rate monitoring
- Automatic pause when tab is inactive

## Technical Requirements
- Modern web browser with WebGL support
- Pointer lock API support
- JavaScript enabled
- Recommended: Dedicated graphics card for best performance

## File Structure
- `index.html`: Main game page
- `styles.css`: Game styling
- `game.js`: Main game logic
- `Car.js`: Car class and physics
- `Block.js`: Building generation
- `Cloud.js`: Cloud system
