// 导入必要的模块
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// 模型相关变量
let cube, movablePart, hookGroup, hookY;

// 控制参数对象
export const params = {
  rotation: 0,      // 上部旋转角度
  hookZ: 0,         // 吊钩水平位置
  hookY: 0,         // 吊钩垂直位置
  rotationSpeed: 0.5,  // 旋转速度
  hookSpeed: 0.5    // 吊钩移动速度
};

// 初始化物体
export const initObjects = (scene, initGUICallback) => {
  // 添加定向光以照亮场景
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(1, 1, 1);
  scene.add(light);

  // 添加环境光以提供基础照明
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 加载模型
  const loader = new GLTFLoader();
  loader.load('/models/tower_crane/scene.gltf', 
    (gltf) => onModelLoad(gltf, scene, initGUICallback),
    onProgress,
    onError
  );
}

// 模型加载成功回调
const onModelLoad = (gltf, scene, initGUICallback) => {
  cube = gltf.scene;
  scene.add(cube);
  cube.position.set(0, 7, 0);
  cube.scale.set(0.01, 0.01, 0.01);

  setupCraneParts(scene);
  initGUICallback && initGUICallback();
}

// 设置塔吊各部件
const setupCraneParts = (scene) => {
  // 创建组结构
  movablePart = new THREE.Group();
  hookGroup = new THREE.Group();
  hookY = new THREE.Group();
  scene.add(movablePart);
  movablePart.add(hookGroup);
  hookGroup.add(hookY);

  // 定义需要移动的mesh
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

  const gouArr = ['poulie_poulie_0'];
  const gouY = [
    'Cylinder222_poulis-support_0',
    'Cylinder213_grue-accroche_0'
  ];

  organizeMeshes(targetMeshes, gouArr, gouY);
}

// 组织模型的mesh结构
const organizeMeshes = (targetMeshes, gouArr, gouY) => {
  const meshes = [];
  
  cube.traverse((child) => {
    if (shouldIncludeMesh(child, targetMeshes, gouArr, gouY)) {
      const { worldPosition, worldQuaternion, worldScale } = getWorldTransform(child);
      child.parent.remove(child);
      addToAppropriateGroup(child, gouArr, gouY, worldPosition, worldQuaternion, worldScale);
      meshes.push(child);
    }
  });

  adjustMeshPositions(meshes);
}

// 获取世界变换信息
const getWorldTransform = (child) => {
  const worldPosition = new THREE.Vector3();
  const worldQuaternion = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();
  
  child.updateWorldMatrix(true, false);
  child.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
  
  return { worldPosition, worldQuaternion, worldScale };
}

// 加载进度回调
const onProgress = (progress) => {
  console.log('加载进度:', (progress.loaded / progress.total * 100) + '%');
}

// 加载错误回调
const onError = (error) => {
  console.error('模型加载错误:', error);
}

// 判断是否应该包含这个mesh
const shouldIncludeMesh = (child, targetMeshes, gouArr, gouY) => {
  return child.isMesh && (
    targetMeshes.includes(child.name) ||
    gouArr.includes(child.name) ||
    gouY.includes(child.name) ||
    child.name == 'grue-barriere-support_grue-barrieres-support_0' ||
    child.name.includes('beton-haut') ||
    child.name.includes('grue-barrieres')
  );
}

// 将mesh添加到适当的组中
const addToAppropriateGroup = (child, gouArr, gouY, worldPosition, worldQuaternion, worldScale) => {
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
}

// 调整mesh位置
const adjustMeshPositions = (meshes) => {
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
}

// 导出模型相关变量
export { movablePart, hookGroup, hookY };