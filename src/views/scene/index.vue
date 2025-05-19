<script setup>
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
  import { onMounted, onUnmounted } from 'vue';

  let scene, camera, renderer, cube, animationFrameId, controls, mixer, gui;

  // 初始化场景
  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#333');
  }

  let movablePart, hookGroup, hookY;

  // 控制参数对象
  const params = {
    rotation: 0,      // 上部旋转角度
    hookZ: 0,         // 吊钩水平位置
    hookY: 0,         // 吊钩垂直位置
    rotationSpeed: 0.5,  // 旋转速度
    hookSpeed: 0.5    // 吊钩移动速度
  };

   // 添加键盘控制函数
  const handleKeyDown = (event) => {
    switch(event.key.toLowerCase()) {
      case 'a': // 左转
        params.rotation += params.rotationSpeed;
        if (movablePart) {
          movablePart.rotation.y = THREE.MathUtils.degToRad(params.rotation);
        }
        towerRotationController.setValue(params.rotation);
        break;
      case 'd': // 右转
        params.rotation -= params.rotationSpeed;
        if (movablePart) {
          movablePart.rotation.y = THREE.MathUtils.degToRad(params.rotation);
          towerRotationController.setValue(params.rotation);
        }
        break;
      case 'q': // 吊钩向前
        params.hookZ += params.hookSpeed;
        // 添加限制
        if (params.hookZ > 8) params.hookZ = 8;
        if (hookGroup) {
          hookGroup.position.z = params.hookZ;
          hookZController.setValue(params.hookZ);
        }
        break;
      case 'e': // 吊钩向后
        params.hookZ -= params.hookSpeed;
        // 添加限制
        if (params.hookZ < -6) params.hookZ = -6;
        if (hookGroup) {
          hookGroup.position.z = params.hookZ;
          hookZController.setValue(params.hookZ);
        }
        break;
      case 'w': // 吊钩上升
        params.hookY += params.hookSpeed;
        // 添加限制
        if (params.hookY > 5.6) params.hookY = 5.6;
        if (hookY) {
          hookY.position.y = params.hookY;
          hookYController.setValue(params.hookY);
        }
        break;
      case 's': // 吊钩下降
        params.hookY -= params.hookSpeed;
        // 添加限制
        if (params.hookY < 0) params.hookY = 0;
        if (hookY) {
          hookY.position.y = params.hookY;
          hookYController.setValue(params.hookY);
        }
        break;
    }
  }


  // 初始化地面
  const initPlane = () => {
    const planeSize = 30;
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
    controls.maxDistance = 1000; // 设置最大缩放距离
  }

  // 初始化相机
  const initCamera = () => {
    const fov = 100;  // 视野角度
    const aspect = window.innerWidth / window.innerHeight;  // 屏幕宽高比
    const near = 0.1;  // 近裁剪面
    const far = 3000;   // 远裁剪面
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(11.5, 14, -1);  // 设置相机位置
    camera.lookAt(0, 0, 0);  // 相机看向原点
  }

  // 初始化物体
  const initObjects = () => {
    const loader = new GLTFLoader();
    loader.load('/models/tower_crane/scene.gltf', (gltf) => {

      // 加载成功后的回调
      cube = gltf.scene;
      scene.add(cube);
      // 可以调整模型位置、旋转、缩放等
      cube.position.set(0, 7, 0);
      cube.scale.set(0.01, 0.01, 0.01);


    // 创建一个组来存储需要移动的部件
      movablePart = new THREE.Group();
      hookGroup = new THREE.Group();
      hookY = new THREE.Group();
      // 将组添加到场景中
      scene.add(movablePart);
      movablePart.add(hookGroup);
      hookGroup.add(hookY);
      
      // 需要移动的mesh名称列表
      const targetMeshes = [
        'cabine_cabine_0',
        'haut-gris_haut-gris_0',
        'corps-top_corps-top_0',
        'plateforme_plateforme_0',
        'plateforme-haut_plateforme-haut_0',
        'cables-haut_cable-haut_0',
        'haut-jaune_haut-jaune_0',
        'corps-haut-1_corps-haut-1_0',
        'corps-haut-2_corps-haut-1_0',
        'corps-haut-3_corps-haut-3_0',
        'attaches-haut_attaches-haut_0',
      ];

      const gouArr = [
        'poulie_poulie_0',
      ]

      const gouY = [
        'Cylinder222_poulis-support_0',
        'Cylinder213_grue-accroche_0',
      ]

      const meshes = [];
      
      cube.traverse((child) => {
        if (
          (targetMeshes.includes(child.name) ||
          gouArr.includes(child.name) ||
          gouY.includes(child.name) ||
          child.name == 'grue-barriere-support_grue-barrieres-support_0' ||
          child.name.includes('beton-haut') ||
          child.name.includes('grue-barrieres')) && 
          child.isMesh
        ) {
          // 获取mesh在世界坐标系中的位置和旋转
          const worldPosition = new THREE.Vector3();
          const worldQuaternion = new THREE.Quaternion();
          const worldScale = new THREE.Vector3();
          
          // 获取世界变换
          child.updateWorldMatrix(true, false);
          child.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
          
          // 从原始父对象中移除
          child.parent.remove(child);
    
          if (gouArr.includes(child.name)) {
            hookGroup.add(child);
          } else if (gouY.includes(child.name)) {
            hookY.add(child);
          } else {
            movablePart.add(child);
          }
          
          // 设置相对于组的位置和旋转
          child.position.copy(worldPosition);
          child.quaternion.copy(worldQuaternion);
          child.scale.copy(worldScale);

          meshes.push(child);
        }
      })

      const boundingBox = new THREE.Box3();
      meshes.forEach(mesh => {
        if (mesh.isMesh && mesh.name == 'haut-jaune_haut-jaune_0') {
          boundingBox.expandByObject(mesh);
        }
      });
      
      // 获取包围盒的中心点
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      
      // 将所有mesh的位置相对于中心点调整
      meshes.forEach(mesh => {
        mesh.position.sub(center);
      });
      
      // 将组的位置设置为中心点
      movablePart.position.copy(center);

      initGUI();
    

    window.addEventListener('keydown', handleKeyDown);

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
    
    // 添加定向光以照亮场景
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1);
    scene.add(light);

    // 添加环境光以提供基础照明
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
  }

  let towerRotationController, hookZController, hookYController;

  const initGUI = () => {
    gui = new GUI();

    // const cameraFolder = gui.addFolder('相机控制');
    // cameraFolder.add(camera.position, 'x', -100, 100, 0.1).name('相机X');
    // cameraFolder.add(camera.position, 'y', -100, 100, 0.1).name('相机Y'); 
    // cameraFolder.add(camera.position, 'z', -100, 100, 0.1).name('相机Z');
    // cameraFolder.open();

    // 添加旋转控制
    const rotationFolder = gui.addFolder('旋转控制');
    towerRotationController = rotationFolder.add(movablePart.rotation, 'y', 0, Math.PI * 2, 0.1)
      .name('塔身旋转')
      .onChange((value) => {
        movablePart.rotation.y = value
      });

    // 大臂移动 
    const hookFolder = gui.addFolder('大臂移动');
    hookZController = hookZController = hookFolder.add(hookGroup.position, 'z', -6, 8, 1)
      .name('大臂横向移动')
      .onChange((value) => {
        hookGroup.position.z = value;
      });;

    // 添加高度控制
    const heightFolder = gui.addFolder('高度控制');
    hookYController = heightFolder.add(params, 'hookY', 0, 5.6, 0.1)
      .name('吊钩高度')
      .onChange((value) => {
        hookY.position.set(0, value, 0);
      });

    // 展开所有文件夹
    rotationFolder.open();
    hookFolder.open();
    heightFolder.open();
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
    if (gui) {
      gui.destroy();
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