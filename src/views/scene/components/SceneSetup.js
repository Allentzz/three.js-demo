// 导入Three.js核心模块
import * as THREE from 'three';

// 场景相关变量
let scene, camera, renderer;

// 初始化场景
export const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#333');
  return scene;
}

// 初始化相机
export const initCamera = () => {
  const fov = 100;  // 视野角度
  const aspect = window.innerWidth / window.innerHeight;  // 屏幕宽高比
  const near = 0.1;  // 近裁剪面
  const far = 3000;   // 远裁剪面
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(11.5, 14, -1);  // 设置相机位置
  camera.lookAt(0, 0, 0);  // 相机看向原点
  return camera;
}

// 初始化渲染器
export const initRenderer = () => {
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({
    antialias: true, 
    canvas,
    preserveDrawingBuffer: true
  });
  
  // 设置设备像素比以提高渲染质量
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
}

// 处理窗口大小变化
export const onWindowResize = () => {
  const canvas = renderer.domElement;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();  // 更新相机投影矩阵
}