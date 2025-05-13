<script setup>
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import { onMounted, onUnmounted } from 'vue';

  let scene, camera, renderer, cube, animationFrameId, controls, mixer;

  // 初始化场景
  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
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
    scene.add(mesh);
  }

  // 初始化控制器
  const initControls = () => {
     // 添加 OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果
    controls.dampingFactor = 0.05; // 设置阻尼系数
    controls.screenSpacePanning = false; // 禁用屏幕空间平移
    controls.minDistance = 1; // 设置最小缩放距离
    controls.maxDistance = 30; // 设置最大缩放距离
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

  // 初始化物体
  const initObjects = () => {
    const loader = new GLTFLoader();
    // loader.load('/models/CesiumMilkTruck.gltf', (gltf) => {
    loader.load('/models/BrainStem.gltf', (gltf) => {

      // 加载成功后的回调
      cube = gltf.scene;
      scene.add(cube);
      // 可以调整模型位置、旋转、缩放等
      cube.position.set(0, 0, 0);
      cube.scale.set(1, 1, 1);


      // 创建动画混合器
      mixer = new THREE.AnimationMixer(cube);
      
      // 获取动画剪辑并播放
      if (gltf.animations && gltf.animations.length) {
        // 遍历所有动画并播放
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.play();
        });
      }
    },
    (progress) => {
      // 加载进度回调
      console.log('加载进度:', (progress.loaded / progress.total * 100) + '%');
    },
    (error) => {
      // 加载错误回调
      console.error('模型加载错误:', error);
    }
  );

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshPhongMaterial({color: "green"}); // 使用 MeshPhongMaterial 以支持光照
    // cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    // 添加环境光以提供基础照明
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
  }

  // 初始化渲染器
  const initRenderer = () => {
    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
      antialias: true, 
      canvas,
      preserveDrawingBuffer: true
    });
    
    // 设置设备像素比以提高渲染质量
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // 动画循环
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    
     // 更新控制器
    if (controls) {
      controls.update();
    }

    // 添加立方体旋转动画
    // if (cube) {
    //   // cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;
    // }
    // 更新动画混合器
    if (mixer) {
      // 传入时间增量以更新动画
      mixer.update(0.006); // 假设 60fps，约 16ms 每帧
    }
    
    renderer.render(scene, camera);
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
    initScene();
    initCamera();
    initPlane();
    initObjects();
    initRenderer();
    animate();
    initControls();

    window.addEventListener('resize', onWindowResize);
  }

  onMounted(() => {
    main();
  })

  // 清理函数
  onUnmounted(() => {
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