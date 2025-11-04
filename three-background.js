/* Three.js background — optimized:
   - rAF animation loop
   - resize handling
   - pause when page hidden or tab blurred (visibilitychange)
   - lightweight geometry + particles
*/

(function(){
  const canvas = document.getElementById('bgCanvas');
  if(!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8;

  // lights
  const light = new THREE.DirectionalLight(0x9ee7ff, 0.9);
  light.position.set(5,5,5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  // group of low-poly meshes
  const group = new THREE.Group();
  scene.add(group);

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, flatShading: true, roughness: 0.9, metalness: 0.1, transparent: true, opacity: 0.9 });

  for(let i=0;i<6;i++){
    const geo = new THREE.IcosahedronGeometry(0.9 + Math.random()*1.2, 0);
    const mat = baseMat.clone();
    mat.opacity = 0.35 + Math.random()*0.5;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random()-0.5)*10, (Math.random()-0.5)*6, (Math.random()-0.5)*-6);
    mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
    group.add(mesh);
  }

  // particles
  const pCount = 350;
  const positions = new Float32Array(pCount * 3);
  for(let i=0;i<positions.length;i++) positions[i] = (Math.random()-0.5) * 20;
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.03, transparent: true, opacity: 0.8 });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // parallax target from mouse
  const target = { x:0, y:0 };
  function onMove(e){
    target.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
    target.y = (e.clientY / window.innerHeight - 0.5) * 0.6;
  }
  window.addEventListener('mousemove', onMove, { passive:true });

  // resize handling
  function resize(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize, { passive:true });
  resize();

  // animation loop
  let raf = null;
  function animate(){
    raf = requestAnimationFrame(animate);
    group.children.forEach((m,i) => {
      m.rotation.y += 0.002 + i*0.0003;
      m.rotation.x += 0.0015;
    });
    camera.position.x += (target.x - camera.position.x) * 0.03;
    camera.position.y += (-target.y - camera.position.y) * 0.03;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  // Pause/resume based on visibility
  function onVisibility(){
    if(document.hidden){
      if(raf) cancelAnimationFrame(raf);
      raf = null;
    } else {
      if(!raf) animate();
    }
  }
  document.addEventListener('visibilitychange', onVisibility);
  // pause on blur
  window.addEventListener('blur', () => { if(raf) cancelAnimationFrame(raf); raf = null; });
  window.addEventListener('focus', () => { if(!raf) animate(); });

  // Cleanup before unload (best practice)
  window.addEventListener('unload', () => {
    if(raf) cancelAnimationFrame(raf);
    renderer.dispose();
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibility);
  });
})();
