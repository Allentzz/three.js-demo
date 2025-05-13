<script setup>
  import * as THREE from 'three';
  import { onMounted, onUnmounted } from 'vue';

  let scene, camera, renderer, cube, animationFrameId;

  // 初始化场景
  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
  }

  // 初始化相机
  const initCamera = () => {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 3;
    camera = new THREE.OrthographicCamera(
      -frustumSize * aspect,
      frustumSize * aspect,
      frustumSize,
      -frustumSize,
      1,
      10
    );
    camera.position.set(4, -3, 5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
  }

  // 初始化物体
  const initObjects = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: "green"}); // 使用 MeshPhongMaterial 以支持光照
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

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
    
    // 添加立方体旋转动画
    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
  }

  // 处理窗口大小变化
  const onWindowResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    
    // 根据屏幕宽高比调整正交相机的视口
    const frustumSize = 3;
    camera.left = -frustumSize * aspect;
    camera.right = frustumSize * aspect;
    camera.top = frustumSize;
    camera.bottom = -frustumSize;
    
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // 主函数
  const main = () => {
    initScene();
    initCamera();
    initObjects();
    initRenderer();
    animate();

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