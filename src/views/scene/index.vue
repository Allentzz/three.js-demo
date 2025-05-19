<script setup>
  import { onMounted, onUnmounted } from 'vue';
  import { initScene, initCamera, initRenderer, onWindowResize } from './components/SceneSetup';
  import { initControls, updateControls } from './components/Controls';
  import { initPlane } from './components/Ground';
  import { initObjects } from './components/CraneModel';
  import { handleKeyDown } from './components/KeyboardControls';
  import { initGUI, destroyGUI } from './components/GUIControls';

  // 场景相关变量
  let scene, camera, renderer, controls, animationFrameId;
  let controllers;
  
  // 动画循环
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    updateControls();
    renderer.render(scene, camera);
  }
  
  // 主函数
  const main = () => {
    // 初始化场景
    scene = initScene();
    // 初始化相机
    camera = initCamera();
    // 初始化渲染器
    renderer = initRenderer();
    // 初始化控制器
    controls = initControls(camera, renderer);
    // 初始化地面和模型
    initPlane(scene);
    initObjects(scene, () => {
      controllers = initGUI();
      window.addEventListener('keydown', (e) => handleKeyDown(e, controllers));
    });
    animate();
  }

  onMounted(() => {
    main();
    window.addEventListener('resize', onWindowResize);
  })
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    destroyGUI();
    
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