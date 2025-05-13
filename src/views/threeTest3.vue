<script setup>
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import * as CANNON from 'cannon-es';  // 导入物理引擎
  import { onMounted, onUnmounted } from 'vue';

  // 声明全局变量
  let scene, camera, renderer, ballMesh, animationFrameId, controls;
  let world, timeStep = 1/60;  // 物理世界和时间步长
  let bodies = [], meshes = [];  // 存储物理体和对应的网格模型

  // 射线检测器，用于鼠标交互
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // 纹理加载器和纹理数组
  const textureLoader = new THREE.TextureLoader();
  const textures = [
    textureLoader.load('/assets/moon.png'),
    textureLoader.load('/assets/earth.jpg')
  ];
  let currentTextureIndex = 0;

  // 初始化物理世界
  const initPhysics = () => {
    // 创建物理世界并设置重力
    world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)  // 设置重力加速度，y轴向下
    });
    
    // 创建地面物理体
    const groundShape = new CANNON.Plane();  // 创建平面形状
    const groundBody = new CANNON.Body({
      mass: 0,  // 质量为0表示静态物体
      shape: groundShape
    });
    // 旋转地面使其水平
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);
  }

  // 初始化Three.js场景
  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);  // 设置天空蓝背景
  }

  // 初始化相机
  const initCamera = () => {
    const fov = 75;  // 视野角度
    const aspect = window.innerWidth / window.innerHeight;  // 屏幕宽高比
    const near = 0.1;  // 近裁剪面
    const far = 100;   // 远裁剪面
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(4, 4, 4);  // 设置相机位置
    camera.lookAt(0, 0, 0);  // 相机看向原点
  }

  // 初始化轨道控制器
  const initControls = () => {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // 启用阻尼效果，使控制更平滑
    controls.dampingFactor = 0.05;  // 阻尼系数
    controls.screenSpacePanning = false;
    controls.minDistance = 1;  // 最小缩放距离
    controls.maxDistance = 50;  // 最大缩放距离
    controls.maxPolarAngle = Math.PI / 2;  // 限制垂直旋转角度

    controls.target.set(0, 0, 0);  // 设置控制器目标点
    controls.update();  // 更新控制器
  }

  // 初始化地面
  const initPlane = () => {
    const planeSize = 20;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('img/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    mesh.receiveShadow = true;  // 接收阴影
    scene.add(mesh);
  }
  // 初始化物体（立方体）
  const initObjects = () => {
    // 创建立方体几何体和材质
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterials = [
      0xff0000, 0x00ff00, 0x0000ff, 
      0xff00ff, 0xffff00, 0x00ffff
    ].map(color => new THREE.MeshPhongMaterial({ color }));

    // 创建20个随机位置的立方体
    for (let i = 0; i < 20; i++) {
      // 创建视觉网格
      const material = cubeMaterials[Math.floor(Math.random() * cubeMaterials.length)];
      const mesh = new THREE.Mesh(cubeGeometry, material);
      mesh.castShadow = true;  // 投射阴影
      scene.add(mesh);
      meshes.push(mesh);
      
      // 创建物理体
      const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));  // 物理形状
      const body = new CANNON.Body({
        mass: 1,  // 质量为1的动态物体
        shape: shape,
        position: new CANNON.Vec3(
          (Math.random() - 0.5) * 16,  // 随机x位置
          2 + Math.random() * 3,       // 随机y位置
          (Math.random() - 0.5) * 16   // 随机z位置
        )
      });
      
      // 添加阻尼以减少弹跳和旋转
      body.linearDamping = 0.3;    // 线性阻尼
      body.angularDamping = 0.3;   // 角度阻尼
      
      world.addBody(body);
      bodies.push(body);
    }

    // 设置光照
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;  // 启用阴影
    scene.add(directionalLight);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
  }

  // 初始化渲染器
  const initRenderer = () => {
    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
      antialias: true,  // 抗锯齿
      canvas,
      preserveDrawingBuffer: true
    });
    renderer.shadowMap.enabled = true;  // 启用阴影映射
    renderer.setPixelRatio(window.devicePixelRatio);  // 设置设备像素比
    renderer.setSize(window.innerWidth, window.innerHeight);  // 设置渲染尺寸
  }

  // 动画循环
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    
    // 更新物理世界
    world.step(timeStep);

    // 同步物理位置到视觉网格
    for(let i = 0; i < bodies.length; i++) {
      meshes[i].position.copy(bodies[i].position);
      meshes[i].quaternion.copy(bodies[i].quaternion);
    }
    
    controls.update();  // 更新控制器
    renderer.render(scene, camera);  // 渲染场景
  }

  // 添加点击事件处理函数
  const onClick = (event) => {
    // 获取鼠标点击位置
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 创建球体
    const radius = 0.5;  // 球体半径
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: Math.random() * 0xffffff  // 随机颜色
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.castShadow = true;
    scene.add(sphereMesh);
    meshes.push(sphereMesh);

    // 创建球体的物理体
    const sphereShape = new CANNON.Sphere(radius);
    const sphereBody = new CANNON.Body({
      mass: 1,
      shape: sphereShape,
      position: new CANNON.Vec3(
        (Math.random() - 0.5) * 16,  // 随机x位置
        10,                          // 固定高度
        (Math.random() - 0.5) * 16   // 随机z位置
      )
    });
    
    // 添加阻尼
    sphereBody.linearDamping = 0.3;
    sphereBody.angularDamping = 0.3;
    
    world.addBody(sphereBody);
    bodies.push(sphereBody);
  }

  // 处理窗口大小变化
  const onWindowResize = () => {
    const canvas = renderer.domElement;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();  // 更新相机投影矩阵
  }

  // 主函数
  const main = () => {
    initScene();      // 初始化场景
    initCamera();     // 初始化相机
    initPhysics();    // 初始化物理世界
    initPlane();      // 初始化地面
    initObjects();    // 初始化物体
    initRenderer();   // 初始化渲染器
    initControls();   // 初始化控制器
    animate();        // 开始动画循环

    // 添加点击事件监听
    window.addEventListener('click', onClick);
    window.addEventListener('resize', onWindowResize);  // 监听窗口大小变化
  }

  onMounted(() => {
    main();
  })

  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('click', onClick);  // 移除点击事件监听
    window.removeEventListener('resize', onWindowResize);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    // 释放资源
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