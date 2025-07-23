# 3D Scene Editor App

A React-based 3D scene editor using Three.js, @react-three/fiber, and Material-UI. This app allows you to:

- Create and customize a wall
- Load and place 3D models (GLB format)
- Enable Spline Path mode to add and move spheres
- Connect spheres with a spline path
- Animate the camera along the spline path with adjustable speed
- Control the scene with an intuitive sidebar UI

## Features

- **Wall Creation:** Enter custom dimensions for a wall and visualize it in 3D.
- **Model Loading:** Add pre-defined 3D models (door, sofa, table) to the scene.
- **Spline Path:**
  - Enable Spline Path mode to add spheres as path points
  - Move spheres interactively (translate)
  - Spline line connects the spheres
  - Play: Camera animates along the spline (spheres/line hidden during animation)
  - Stop: Resets the path and animation
  - Adjustable speed slider for animation
- **Keyboard Shortcuts:**
  - `T`: Translate mode
  - `R`: Rotate mode
  - `S`: Scale mode
  - `Q`: Deselect model

## Tech Stack & Dependencies

- [React](https://reactjs.org/)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [three](https://threejs.org/)
- [@react-three/drei](https://docs.pmnd.rs/react-three-drei/introduction)
- [@mui/material](https://mui.com/material-ui/getting-started/overview/)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## Usage Guide

- **Left Sidebar:**
  - Load 3D models into the scene.
- **Right Sidebar:**
  - Enter wall dimensions and create a wall.
  - Spline Path section:
    - Enable Spline Path: Start adding spheres.
    - Add Path: Add a new sphere to the path.
    - Play: Animate the camera along the spline (requires at least 2 spheres).
    - Stop: Reset the path and animation.
    - Speed: Adjust the camera animation speed.
- **Scene Controls:**
  - Click spheres to select and move them.
  - Use mouse to orbit, pan, and zoom the scene.

## File Structure

- `src/App.jsx` — Main app logic and state
- `components/SideBar.jsx` — Sidebar UI and controls
- `components/ThreejsScene.jsx` — 3D scene logic and rendering
- `public/` — 3D model files (GLB)

