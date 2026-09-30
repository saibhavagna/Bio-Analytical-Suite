'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useDocking } from '@/context/DockingContext';
import { ScientificTooltip } from '@/components/common/ScientificTooltip';

export const MolecularViewer3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    receptor,
    bindingSite,
    activePose,
    activeLigand,
    interactions,
    ui,
    setUI,
    selectedPocket,
    pockets,
    toggleModal,
  } = useDocking();

  // Internal Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Group references for dynamic updating without re-instantiating scene
  const proteinGroupRef = useRef<THREE.Group | null>(null);
  const ligandGroupRef = useRef<THREE.Group | null>(null);
  const gridBoxGroupRef = useRef<THREE.Group | null>(null);
  const interactionsGroupRef = useRef<THREE.Group | null>(null);
  const pocketMeshRef = useRef<THREE.Mesh | null>(null);
  const pocketProbesGroupRef = useRef<THREE.Group | null>(null);

  // Interaction controls state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraDistanceRef = useRef(42);
  const rotationRef = useRef({ x: 0.25, y: -0.45 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  const [fps, setFps] = useState(60);
  const [hoveredResidue, setHoveredResidue] = useState<string | null>(null);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e13);
    sceneRef.current = scene;

    // Camera
    const aspect = width / height;
    const perspCam = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    perspCam.position.set(0, 5, 42);
    cameraRef.current = perspCam;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = false;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xe2f1ff, 1.4);
    dirLight1.position.set(25, 35, 30);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7395b8, 0.7);
    dirLight2.position.set(-25, -20, -15);
    scene.add(dirLight2);

    const blueBackLight = new THREE.DirectionalLight(0x3a86ff, 0.5);
    blueBackLight.position.set(0, -30, 20);
    scene.add(blueBackLight);

    // Groups
    const proteinGroup = new THREE.Group();
    scene.add(proteinGroup);
    proteinGroupRef.current = proteinGroup;

    const ligandGroup = new THREE.Group();
    scene.add(ligandGroup);
    ligandGroupRef.current = ligandGroup;

    const gridBoxGroup = new THREE.Group();
    scene.add(gridBoxGroup);
    gridBoxGroupRef.current = gridBoxGroup;

    const interactionsGroup = new THREE.Group();
    scene.add(interactionsGroup);
    interactionsGroupRef.current = interactionsGroup;

    const pocketProbesGroup = new THREE.Group();
    scene.add(pocketProbesGroup);
    pocketProbesGroupRef.current = pocketProbesGroup;

    // Pocket cavity surface
    const pocketGeo = new THREE.IcosahedronGeometry(7.5, 3);
    const pocketMat = new THREE.MeshStandardMaterial({
      color: 0x1b2d42,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      roughness: 0.9,
    });
    const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
    pocketMesh.position.set(0, 0, 0);
    scene.add(pocketMesh);
    pocketMeshRef.current = pocketMesh;

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && rendererRef.current && cameraRef.current) {
          rendererRef.current.setSize(w, h);
          if (cameraRef.current instanceof THREE.PerspectiveCamera) {
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
          } else if (cameraRef.current instanceof THREE.OrthographicCamera) {
            const frustum = 20;
            cameraRef.current.left = (-frustum * w) / h;
            cameraRef.current.right = (frustum * w) / h;
            cameraRef.current.top = frustum;
            cameraRef.current.bottom = -frustum;
            cameraRef.current.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(container);

    // Render loop
    let frameCount = 0;
    let lastTime = performance.now();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth camera position from orbit angles
      if (cameraRef.current) {
        const cam = cameraRef.current;
        const dist = cameraDistanceRef.current;
        const rot = rotationRef.current;

        const target = targetLookAtRef.current;
        const cx = target.x + dist * Math.sin(rot.y) * Math.cos(rot.x);
        const cy = target.y + dist * Math.sin(rot.x);
        const cz = target.z + dist * Math.cos(rot.y) * Math.cos(rot.x);

        cam.position.set(cx, cy, cz);
        cam.lookAt(target);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Ortho/Perspective Camera when ui.isOrtho changes
  useEffect(() => {
    if (!rendererRef.current || !containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const aspect = w / h;

    if (ui.isOrtho) {
      const frustum = 18;
      const orthoCam = new THREE.OrthographicCamera(
        -frustum * aspect,
        frustum * aspect,
        frustum,
        -frustum,
        0.1,
        1000
      );
      cameraRef.current = orthoCam;
    } else {
      const perspCam = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
      cameraRef.current = perspCam;
    }
  }, [ui.isOrtho]);

  // Build / Update Protein Model
  useEffect(() => {
    if (!proteinGroupRef.current) return;
    const group = proteinGroupRef.current;
    group.clear();

    const isCPK = ui.representation === 'CPK';
    const isSticks = ui.representation === 'Sticks';
    const isSurface = ui.representation === 'Surface';
    // default is Cartoon Ribbon

    // Primary alpha helix 1
    const helix1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14, -8, -6),
      new THREE.Vector3(-11, -3, -2),
      new THREE.Vector3(-8, 3, 2),
      new THREE.Vector3(-6, 8, 4),
      new THREE.Vector3(-3, 11, 2),
      new THREE.Vector3(0, 10, -4),
    ]);
    const helix1Geo = new THREE.TubeGeometry(helix1Curve, 40, isCPK ? 1.6 : isSticks ? 0.4 : 0.85, 12, false);
    const helix1Mat = new THREE.MeshStandardMaterial({
      color: ui.colorScheme === 'Chain' ? 0x3b82c4 : 0x2c435e,
      roughness: 0.35,
      metalness: 0.15,
      wireframe: isSurface,
    });
    group.add(new THREE.Mesh(helix1Geo, helix1Mat));

    // Alpha helix 2 (catalytic backing)
    const helix2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(5, -12, -8),
      new THREE.Vector3(8, -6, -4),
      new THREE.Vector3(10, 0, 1),
      new THREE.Vector3(8, 7, 5),
      new THREE.Vector3(5, 12, 6),
    ]);
    const helix2Geo = new THREE.TubeGeometry(helix2Curve, 36, isCPK ? 1.6 : isSticks ? 0.4 : 0.8, 12, false);
    const helix2Mat = new THREE.MeshStandardMaterial({
      color: ui.colorScheme === 'Hydrophobic' ? 0x2a9d8f : 0x3b82c4,
      roughness: 0.35,
      metalness: 0.15,
      wireframe: isSurface,
    });
    group.add(new THREE.Mesh(helix2Geo, helix2Mat));

    // Beta sheet loops embracing active pocket
    const betaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-9, 1, 6),
      new THREE.Vector3(-5, 0, 8),
      new THREE.Vector3(-1, -2, 7),
      new THREE.Vector3(3, -1, 5),
      new THREE.Vector3(6, 2, 3),
      new THREE.Vector3(4, 6, -1),
    ]);
    const betaGeo = new THREE.TubeGeometry(betaCurve, 32, isCPK ? 1.4 : isSticks ? 0.35 : 0.65, 10, false);
    const betaMat = new THREE.MeshStandardMaterial({
      color: 0x4a6572,
      roughness: 0.4,
      metalness: 0.1,
      wireframe: isSurface,
    });
    group.add(new THREE.Mesh(betaGeo, betaMat));

    // Connecting active site loop with key residues
    const loopCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, -6, 2),
      new THREE.Vector3(-2, -7, 4),
      new THREE.Vector3(1, -6, 5),
      new THREE.Vector3(4, -7, 2),
    ]);
    const loopGeo = new THREE.TubeGeometry(loopCurve, 20, 0.4, 8, false);
    const loopMat = new THREE.MeshStandardMaterial({
      color: 0x5b7083,
      roughness: 0.4,
    });
    group.add(new THREE.Mesh(loopGeo, loopMat));

    // Key Catalytic Residues represented as sidechain sticks & spheres
    const residues = [
      { name: 'HIS-41', pos: new THREE.Vector3(3.2, 1.8, 1.5), color: 0x48cae4 },
      { name: 'CYS-145', pos: new THREE.Vector3(-2.8, -1.9, 2.1), color: 0xe9c46a },
      { name: 'GLU-166', pos: new THREE.Vector3(-4.5, 2.6, 2.8), color: 0xe76f51 },
      { name: 'GLY-143', pos: new THREE.Vector3(0.5, -2.4, 3.2), color: 0x2a9d8f },
      { name: 'TYR-122', pos: new THREE.Vector3(5.1, -1.2, -1.4), color: 0x9dcaeb },
      { name: 'ASP-85', pos: new THREE.Vector3(-5.2, -3.8, 0.2), color: 0xe76f51 },
    ];

    residues.forEach((res) => {
      // Residue sphere anchor
      const sphereGeo = new THREE.SphereGeometry(0.7, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: res.color,
        roughness: 0.3,
        metalness: 0.1,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(res.pos);
      sphere.userData = { residue: res.name };
      group.add(sphere);

      // Sidechain branch line to backbone
      const stickGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 8);
      const stickMat = new THREE.MeshStandardMaterial({ color: 0x8a9ba8, roughness: 0.5 });
      const stick = new THREE.Mesh(stickGeo, stickMat);
      stick.position.set(res.pos.x * 0.85, res.pos.y * 0.85, res.pos.z * 0.85);
      group.add(stick);
    });
  }, [ui.representation, ui.colorScheme]);

  // Build / Update 3D Docked Ligand with conformer coordinates shifting by Pose
  useEffect(() => {
    if (!ligandGroupRef.current) return;
    const group = ligandGroupRef.current;
    group.clear();

    // The pose parameters determine rotation and minor translation
    const rankOffset = (activePose.rank - 1) * 0.15;
    const rotZ = (activePose.conformerIndex - 1) * 0.32;
    const rotY = (activePose.conformerIndex - 1) * 0.24;
    const rotX = (activePose.conformerIndex - 1) * 0.18;

    // Center offset based on pose
    group.rotation.set(rotX, rotY, rotZ);
    group.position.set(
      (activePose.rmsd - 1.23) * 0.45,
      -(activePose.rmsd - 1.23) * 0.35,
      (activePose.rank - 1) * 0.1
    );

    // Synthetic 18-atom ligand backbone (peptidomimetic / small molecule)
    const rawAtoms = [
      { elem: 'C', pos: [-2.1, 1.2, 1.1], color: 0xe9c46a }, // C1
      { elem: 'O', pos: [-2.8, 2.1, 1.4], color: 0xe76f51 }, // O1 (H-bond to Glu166)
      { elem: 'N', pos: [-0.8, 1.3, 0.8], color: 0x48cae4 }, // N1
      { elem: 'C', pos: [0.0, 0.2, 0.4], color: 0xe9c46a },  // CA
      { elem: 'C', pos: [1.4, 0.7, 0.2], color: 0xe9c46a },  // C2
      { elem: 'O', pos: [1.7, 1.8, 0.5], color: 0xe76f51 },  // O2
      { elem: 'N', pos: [2.3, -0.2, -0.4], color: 0x48cae4 },// N2
      { elem: 'C', pos: [3.6, 0.3, -0.6], color: 0xe9c46a }, // C3 (Hydrophobic to His41)
      { elem: 'C', pos: [4.4, -0.7, -1.2], color: 0xe9c46a },// Phenyl 1
      { elem: 'C', pos: [5.7, -0.4, -1.5], color: 0xe9c46a },// Phenyl 2
      { elem: 'C', pos: [6.3, 0.8, -1.1], color: 0xe9c46a }, // Phenyl 3
      { elem: 'C', pos: [5.5, 1.8, -0.5], color: 0xe9c46a }, // Phenyl 4
      { elem: 'C', pos: [4.2, 1.5, -0.3], color: 0xe9c46a }, // Phenyl 5
      { elem: 'C', pos: [-0.4, -1.1, 0.1], color: 0xe9c46a },// Sidechain C
      { elem: 'S', pos: [-1.4, -2.1, 1.0], color: 0xf4a261 },// Sulfur/Thiol near Cys145
      { elem: 'C', pos: [-0.6, -3.3, 1.8], color: 0xe9c46a },// Tail
      { elem: 'O', pos: [0.5, -3.6, 1.3], color: 0xe76f51 }, // Tail O
    ];

    const bonds = [
      [0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7],
      [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 7],
      [3, 13], [13, 14], [14, 15], [15, 16]
    ];

    // Atom spheres
    rawAtoms.forEach((atom, idx) => {
      const radius = atom.elem === 'C' ? 0.42 : atom.elem === 'S' ? 0.52 : 0.48;
      const sphereGeo = new THREE.SphereGeometry(radius, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: atom.color,
        roughness: 0.25,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(atom.pos[0], atom.pos[1], atom.pos[2]);
      mesh.userData = { atomIdx: idx, elem: atom.elem };
      group.add(mesh);
    });

    // Bond cylinders
    bonds.forEach(([i1, i2]) => {
      const p1 = new THREE.Vector3(...rawAtoms[i1].pos);
      const p2 = new THREE.Vector3(...rawAtoms[i2].pos);
      const dist = p1.distanceTo(p2);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      const cylinderGeo = new THREE.CylinderGeometry(0.14, 0.14, dist, 8);
      const cylinderMat = new THREE.MeshStandardMaterial({
        color: 0xd9dfe6,
        roughness: 0.3,
        metalness: 0.3,
      });
      const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
      cylinder.position.copy(mid);
      cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3().subVectors(p2, p1).normalize()
      );
      group.add(cylinder);
    });
  }, [activePose]);

  // Build / Update 3D Search Space Grid Box connected directly to BindingSite state
  useEffect(() => {
    if (!gridBoxGroupRef.current) return;
    const group = gridBoxGroupRef.current;
    group.clear();

    if (!bindingSite.showGrid || !ui.showGridBox) return;

    const size = bindingSite.size;
    const center = bindingSite.center;
    // Map bindingSite center coordinates relative to canonical pocket origin (12.40, -4.20, 8.15)
    const offsetX = (center.x - 12.40) * 0.7;
    const offsetY = (center.y - (-4.20)) * 0.7;
    const offsetZ = (center.z - 8.15) * 0.7;

    const boxGeo = new THREE.BoxGeometry(size.x * 0.7, size.y * 0.7, size.z * 0.7);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x48cae4,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.85,
    });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    wireframe.position.set(offsetX, offsetY, offsetZ);
    group.add(wireframe);

    // Corner spheres
    const corners = [
      [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
    ];
    const halfX = (size.x * 0.7) / 2;
    const halfY = (size.y * 0.7) / 2;
    const halfZ = (size.z * 0.7) / 2;

    const cornerMat = new THREE.MeshBasicMaterial({ color: 0x48cae4 });
    corners.forEach(([cx, cy, cz]) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), cornerMat);
      dot.position.set(offsetX + cx * halfX, offsetY + cy * halfY, offsetZ + cz * halfZ);
      group.add(dot);
    });

    // Center Crosshair
    const crossGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(offsetX - 1.2, offsetY, offsetZ), new THREE.Vector3(offsetX + 1.2, offsetY, offsetZ),
      new THREE.Vector3(offsetX, offsetY - 1.2, offsetZ), new THREE.Vector3(offsetX, offsetY + 1.2, offsetZ),
      new THREE.Vector3(offsetX, offsetY, offsetZ - 1.2), new THREE.Vector3(offsetX, offsetY, offsetZ + 1.2),
    ]);
    const crossMat = new THREE.LineBasicMaterial({ color: 0xe9c46a });
    const cross = new THREE.LineSegments(crossGeo, crossMat);
    group.add(cross);
  }, [bindingSite.size, bindingSite.center, bindingSite.showGrid, ui.showGridBox]);

  // Build / Update Intermolecular Interaction Lines & Badges
  useEffect(() => {
    if (!interactionsGroupRef.current) return;
    const group = interactionsGroupRef.current;
    group.clear();

    if (!ui.showHBonds && !ui.showHydrophobic) return;

    // Contact endpoints matching current conformation
    const contactLines = [
      {
        type: 'Hydrogen Bond',
        start: new THREE.Vector3(-2.8, 2.1, 1.4), // Ligand O1
        end: new THREE.Vector3(-4.5, 2.6, 2.8),   // Glu166 N
        color: 0x48cae4,
        distance: interactions[0]?.distance || 2.10,
        residue: 'GLU166',
      },
      {
        type: 'Hydrophobic',
        start: new THREE.Vector3(3.6, 0.3, -0.6),  // Ligand C3
        end: new THREE.Vector3(3.2, 1.8, 1.5),     // His41
        color: 0x2a9d8f,
        distance: interactions[1]?.distance || 3.85,
        residue: 'HIS41',
      },
      {
        type: 'Hydrogen Bond',
        start: new THREE.Vector3(1.7, 1.8, 0.5),   // Ligand O2
        end: new THREE.Vector3(0.5, -2.4, 3.2),    // Gly143
        color: 0x48cae4,
        distance: interactions[2]?.distance || 2.42,
        residue: 'GLY143',
      },
      {
        type: 'Hydrophobic',
        start: new THREE.Vector3(-1.4, -2.1, 1.0), // Ligand S/C
        end: new THREE.Vector3(-2.8, -1.9, 2.1),   // Cys145
        color: 0x2a9d8f,
        distance: interactions[3]?.distance || 3.40,
        residue: 'CYS145',
      },
    ];

    contactLines.forEach((item) => {
      if (item.type === 'Hydrogen Bond' && !ui.showHBonds) return;
      if (item.type === 'Hydrophobic' && !ui.showHydrophobic) return;

      const points = [item.start, item.end];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: item.color,
        dashSize: 0.45,
        gapSize: 0.3,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      group.add(line);

      // Midpoint measurement sphere
      const mid = new THREE.Vector3().addVectors(item.start, item.end).multiplyScalar(0.5);
      const badgeGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const badgeMat = new THREE.MeshBasicMaterial({ color: item.color });
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.position.copy(mid);
      badge.userData = { residue: item.residue, distance: item.distance };
      group.add(badge);
    });
  }, [interactions, ui.showHBonds, ui.showHydrophobic, activePose]);

  // Build / Update Pocket Cavity Surface and Alpha-Sphere Probes
  useEffect(() => {
    if (!pocketProbesGroupRef.current) return;
    const group = pocketProbesGroupRef.current;
    group.clear();

    const activePkt = selectedPocket || pockets[0];

    // Check if pocket cavity is visible
    if (!ui.showPocketCavity || !activePkt) {
      if (pocketMeshRef.current) {
        pocketMeshRef.current.visible = false;
      }
      return;
    }

    // Update pocketMesh position and scale based on active pocket
    if (pocketMeshRef.current) {
      pocketMeshRef.current.visible = true;
      const offsetX = (activePkt.center.x - 12.40) * 0.7;
      const offsetY = (activePkt.center.y - (-4.20)) * 0.7;
      const offsetZ = (activePkt.center.z - 8.15) * 0.7;
      pocketMeshRef.current.position.set(offsetX, offsetY, offsetZ);

      // Scale mesh to match pocket volume
      const radiusScale = Math.max(0.6, Math.cbrt(activePkt.volume / 650));
      pocketMeshRef.current.scale.set(radiusScale, radiusScale, radiusScale);
    }

    // Render probe points as small spheres
    const probeGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const apolarMat = new THREE.MeshStandardMaterial({
      color: 0x48cae4,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const polarMat = new THREE.MeshStandardMaterial({
      color: 0x2a9d8f,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const donorAcceptorMat = new THREE.MeshStandardMaterial({
      color: 0xe9c46a,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });

    const probes = activePkt.probePoints || [];
    probes.forEach((p) => {
      const px = (p.x - 12.40) * 0.7;
      const py = (p.y - (-4.20)) * 0.7;
      const pz = (p.z - 8.15) * 0.7;

      let mat = apolarMat;
      if (p.type === 'polar') mat = polarMat;
      if (p.type === 'h-bond-donor' || p.type === 'h-bond-acceptor') mat = donorAcceptorMat;

      const sphere = new THREE.Mesh(probeGeo, mat);
      sphere.position.set(px, py, pz);
      group.add(sphere);
    });

    // Centroid diamond indicator for selected pocket
    const centroidGeo = new THREE.OctahedronGeometry(0.55, 0);
    const centroidMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261,
      emissive: 0xe76f51,
      emissiveIntensity: 0.45,
    });
    const centroidMesh = new THREE.Mesh(centroidGeo, centroidMat);
    const cx = (activePkt.center.x - 12.40) * 0.7;
    const cy = (activePkt.center.y - (-4.20)) * 0.7;
    const cz = (activePkt.center.z - 8.15) * 0.7;
    centroidMesh.position.set(cx, cy, cz);
    group.add(centroidMesh);
  }, [selectedPocket, pockets, ui.showPocketCavity]);

  // Mouse interaction handlers for smooth 3D Orbiting & Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
    } else if (e.button === 2 || e.shiftKey) {
      isPanningRef.current = true;
    }
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      rotationRef.current.y -= deltaX * 0.007;
      rotationRef.current.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, rotationRef.current.x - deltaY * 0.007)
      );
    } else if (isPanningRef.current) {
      targetLookAtRef.current.x -= deltaX * 0.04;
      targetLookAtRef.current.y += deltaY * 0.04;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
    cameraDistanceRef.current = Math.max(12, Math.min(95, cameraDistanceRef.current * zoomFactor));
  };

  // Camera toolbar actions
  const resetCamera = useCallback(() => {
    rotationRef.current = { x: 0.25, y: -0.45 };
    cameraDistanceRef.current = 42;
    targetLookAtRef.current.set(0, 0, 0);
  }, []);

  const fitView = useCallback(() => {
    cameraDistanceRef.current = 34;
    targetLookAtRef.current.set(0, 0, 0);
  }, []);

  const centerCavity = useCallback(() => {
    cameraDistanceRef.current = 24;
    targetLookAtRef.current.set(0, 0, 0);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0A0E13] overflow-hidden select-none border border-[#1A222C]">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing outline-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Top Left HUD: Molecule, Conformation & Resolution */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider text-[#7395B8] bg-[#111720]/85 px-2 py-0.5 rounded border border-[#202C3A]">
            RECEPTOR: {receptor.filename} (CHAIN {receptor.chain})
          </span>
          <span className="text-[10px] font-mono text-[#48CAE4] bg-[#111720]/85 px-2 py-0.5 rounded border border-[#202C3A]">
            {receptor.resolution} Å X-RAY
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] font-mono font-semibold text-[#E9C46A] bg-[#16202C]/90 px-2 py-0.5 rounded border border-[#2E3C4E]">
            LIGAND: {activeLigand.id} • {activePose.id} (RANK #{activePose.rank})
          </span>
          <ScientificTooltip metricId="deltaG" position="bottom">
            <span className="text-[10px] font-mono text-[#4FAE7B] bg-[#16202C]/90 px-2 py-0.5 rounded border border-[#2E3C4E] hover:border-[#4FAE7B] cursor-help transition-colors">
              ΔG {activePose.deltaG} kcal/mol
            </span>
          </ScientificTooltip>
        </div>
      </div>

      {/* Top Right HUD: View Controls & Projection */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button
          id="btn-pocket-probes-toggle"
          onClick={() => setUI((prev) => ({ ...prev, showPocketCavity: !prev.showPocketCavity }))}
          className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
            ui.showPocketCavity
              ? 'bg-[#153428] border-[#4FAE7B] text-[#4FAE7B]'
              : 'bg-[#121922] border-[#222E3D] text-[#8C9BAE] hover:text-[#EDF2F7]'
          }`}
          title="Toggle Pocket Cavity Surface Probes in 3D"
        >
          {ui.showPocketCavity ? 'CAV PROBES: ON' : 'CAV PROBES: OFF'}
        </button>
        <button
          id="btn-open-pocket-search-hud"
          onClick={() => toggleModal('pocketSearch', true)}
          className="px-2 py-1 text-[10px] font-mono rounded bg-[#1A2838] border border-[#2B435C] text-[#48CAE4] hover:bg-[#20344A] transition-colors cursor-pointer"
          title="Open Protein Surface Grid Pocket Detector"
        >
          POCKETS ({pockets.length})
        </button>
        <button
          id="btn-ortho-toggle"
          onClick={() => setUI((prev) => ({ ...prev, isOrtho: !prev.isOrtho }))}
          className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
            ui.isOrtho
              ? 'bg-[#1C2C3F] border-[#48CAE4] text-[#48CAE4]'
              : 'bg-[#121922] border-[#222E3D] text-[#8C9BAE] hover:text-[#EDF2F7]'
          }`}
          title="Toggle Orthographic / Perspective Projection"
        >
          {ui.isOrtho ? 'ORTHO' : 'PERSP'}
        </button>
        <button
          id="btn-reset-view"
          onClick={resetCamera}
          className="px-2 py-1 text-[10px] font-mono rounded bg-[#121922] border border-[#222E3D] text-[#8C9BAE] hover:text-[#EDF2F7] hover:border-[#38485C] transition-colors cursor-pointer"
          title="Reset Camera Orientation"
        >
          RESET
        </button>
        <button
          id="btn-fit-view"
          onClick={fitView}
          className="px-2 py-1 text-[10px] font-mono rounded bg-[#121922] border border-[#222E3D] text-[#8C9BAE] hover:text-[#EDF2F7] hover:border-[#38485C] transition-colors cursor-pointer"
          title="Fit Full Active Site"
        >
          FIT
        </button>
        <button
          id="btn-center-cavity"
          onClick={centerCavity}
          className="px-2 py-1 text-[10px] font-mono rounded bg-[#121922] border border-[#222E3D] text-[#E9C46A] hover:bg-[#1A2636] transition-colors cursor-pointer"
          title="Center on Catalytic Dyad"
        >
          DYAD
        </button>
      </div>

      {/* Bottom Floating Legend & Scale Overlay */}
      <div className="absolute bottom-3 left-3 pointer-events-none flex flex-wrap items-center gap-2.5 z-10 text-[10px] font-mono text-[#7395B8]">
        {/* Scale Bar */}
        <div className="flex items-center gap-1.5 bg-[#0F151D]/80 px-2 py-1 rounded border border-[#1E2938]">
          <div className="w-12 h-1 bg-[#48CAE4] rounded-sm relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] text-[#A0AEC0]">5 Å</span>
          </div>
        </div>

        {/* Pocket Cavity Indicator */}
        {ui.showPocketCavity && selectedPocket && (
          <div className="flex items-center gap-1.5 bg-[#0F151D]/90 px-2 py-1 rounded border border-[#203D32] text-[#4FAE7B] pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-[#48CAE4] animate-pulse" />
            <span>
              Pocket #{selectedPocket.rank}: {selectedPocket.name}
            </span>
            <ScientificTooltip metricId="druggabilityScore" position="top">
              <span className="text-[#E9C46A] underline decoration-dotted cursor-help">
                (Dscore: {selectedPocket.druggabilityScore.toFixed(2)})
              </span>
            </ScientificTooltip>
          </div>
        )}

        {/* Atom Colors Legend */}
        <div className="flex items-center gap-2 bg-[#0F151D]/80 px-2.5 py-1 rounded border border-[#1E2938]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E9C46A]" />
            <span>C</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#48CAE4]" />
            <span>N</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
            <span>O</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F4A261]" />
            <span>S</span>
          </div>
        </div>

        {/* Contact Vectors Legend */}
        <div className="flex items-center gap-2 bg-[#0F151D]/80 px-2.5 py-1 rounded border border-[#1E2938]">
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 border-t border-dashed border-[#48CAE4]" />
            <span className="text-[#48CAE4]">H-Bond</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 border-t border-dashed border-[#2A9D8F]" />
            <span className="text-[#2A9D8F]">Hydrophobic</span>
          </div>
        </div>
      </div>

      {/* Bottom Right FPS & Engine Status */}
      <div className="absolute bottom-3 right-3 pointer-events-none flex items-center gap-2 z-10 text-[10px] font-mono text-[#62778D] bg-[#0F151D]/80 px-2 py-0.5 rounded border border-[#1E2938]">
        <span>WEBGL 2.0</span>
        <span>•</span>
        <span className="text-[#4FAE7B]">{fps} FPS</span>
      </div>
    </div>
  );
};
