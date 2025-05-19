// 导入必要的模块
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { params } from './CraneModel';
import { movablePart, hookGroup, hookY } from './CraneModel';

// GUI实例
let gui;
let towerRotationController, hookZController, hookYController;

// 初始化GUI
export const initGUI = () => {
  gui = new GUI();

  // 添加旋转控制
  const rotationFolder = gui.addFolder('旋转控制');
  towerRotationController = rotationFolder.add(movablePart.rotation, 'y', 0, Math.PI * 2, 0.1)
    .name('塔身旋转')
    .onChange((value) => {
      movablePart.rotation.y = value;
    });

  // 大臂移动
  const hookFolder = gui.addFolder('大臂移动');
  hookZController = hookFolder.add(hookGroup.position, 'z', -6, 8, 1)
    .name('大臂横向移动')
    .onChange((value) => {
      hookGroup.position.z = value;
    });

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

  return { towerRotationController, hookZController, hookYController };
}

// 销毁GUI
export const destroyGUI = () => {
  if (gui) {
    gui.destroy();
  }
}