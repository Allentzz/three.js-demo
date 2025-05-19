// 导入OrbitControls控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 控制器实例
let controls;

// 初始化控制器
export const initControls = (camera, renderer) => {
  // 添加 OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 启用阻尼效果
  controls.dampingFactor = 0.05; // 设置阻尼系数
  controls.screenSpacePanning = false; // 禁用屏幕空间平移
  controls.minDistance = 1; // 设置最小缩放距离
  controls.maxDistance = 1000; // 设置最大缩放距离
  return controls;
}

// 更新控制器
export const updateControls = () => {
  if (controls) {
    controls.update();
  }
}