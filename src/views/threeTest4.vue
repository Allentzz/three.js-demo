<script setup>
  import * as THREE from 'three';
  import { onMounted, onUnmounted } from 'vue';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import { EffectComposer, RenderPass, EffectPass, BloomEffect } from 'postprocessing';
  
  let scene, camera, renderer, controls, animationFrameId;
  let composer; // 后处理合成器

  // 要更新旋转角度的对象数组
  const objects = [];

  // 初始化后处理效果
  const initPostprocessing = () => {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomEffect = new BloomEffect({
      intensity: 2.0,    // 发光强度
      threshold: 0.5,    // 发光阈值
      radius: 0.8,      // 发光半径
    });

    const effectPass = new EffectPass(camera, bloomEffect);
    effectPass.renderToScreen = true;
    composer.addPass(effectPass);
  }

  // 一球多用
  const radius = 1;
  const widthSegments = 32;
  const heightSegments = 32;
  const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  );

  // 初始化Three.js场景
  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);  // 设置天空蓝背景
  }

  // 初始化相机
  const initCamera = () => {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
  }

  // 初始化轨道控制器
  const initControls = () => {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);
    controls.update();
  }

  // 初始化地面
  const initPlane = () => {
    const planeSize = 70;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('img/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
  }

  // 初始化物体
  const initObjects = () => {
    const solarSystem = new THREE.Object3D();
    scene.add(solarSystem);
    objects.push(solarSystem);

    // 太阳
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      emissive: 0xffff00,
    });
    const sunMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sunMesh.position.set(0, 5, 0);
    sunMesh.scale.set(5, 5, 5);
    solarSystem.add(sunMesh);
    objects.push(sunMesh);

    // 添加点光源
    const sunLight = new THREE.PointLight(0xffffff, 2, 100);
    const sunLight2 = new THREE.PointLight(0xffff99, 1, 100);
    sunLight.position.copy(sunMesh.position);
    sunLight2.position.copy(sunMesh.position);
    solarSystem.add(sunLight);
    solarSystem.add(sunLight2);

    // 全局光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    solarSystem.add(ambientLight);

    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 15;
    earthOrbit.position.y = 5;
    solarSystem.add(earthOrbit);
    objects.push(earthOrbit);

    // 地球
    const earthTexture = new THREE.TextureLoader().load('/img/earth.jpg');
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      color: 0xffffff,
      shininess: 15,
      specular: 0x333333,
      bumpScale: 0.02
    });
    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
    earthOrbit.add(earthMesh);
    objects.push(earthMesh);

    // 月球
    const moonTexture = new THREE.TextureLoader().load('/img/moon.png');
    const moonMaterial = new THREE.MeshPhongMaterial({
      map: moonTexture,
      color: 0xffffff,
      shininess: 15,
      specular: 0x333333,
      bumpScale: 0.02
    });
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.position.x = 2.5;
    moonMesh.scale.set(0.5, 0.5, 0.5);
    earthOrbit.add(moonMesh);
    objects.push(moonMesh);
  }

  // 初始化渲染器
  const initRenderer = () => {
    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas,
      preserveDrawingBuffer: true
    });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // 动画循环
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    objects.forEach(object => {
      object.rotation.y += 0.01;
    });
    composer.render();
  }

  // 处理窗口大小变化
  const onWindowResize = () => {
    const canvas = renderer.domElement;
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // 主函数
  const main = () => {
    initScene();
    initCamera();
    initPlane();
    initObjects();
    initRenderer();
    initControls();
    initPostprocessing();
    animate();
    window.addEventListener('resize', onWindowResize);
  }

  // 组件挂载时初始化
  onMounted(() => {
    main();
  })

  // 组件卸载时清理资源
  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (scene) {
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
    if (renderer) {
      renderer.dispose();
    }
  })
</script>

<template>
  <canvas id="c" ref="canvas"></canvas>
</template>

<style scoped>
#c {
  width: 100%;
  height: 100%;
  display: block;
}
</style>