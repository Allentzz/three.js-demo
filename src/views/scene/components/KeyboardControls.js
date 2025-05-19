// 导入控制参数
import { params } from './CraneModel';
import { movablePart, hookGroup, hookY } from './CraneModel';
import * as THREE from 'three';

// 添加键盘控制函数
export const handleKeyDown = (event, controllers) => {
  const { towerRotationController, hookZController, hookYController } = controllers;

  switch(event.key.toLowerCase()) {
    case 'a': // 左转
      params.rotation += params.rotationSpeed;
      if (movablePart) {
        movablePart.rotation.y = THREE.MathUtils.degToRad(params.rotation);
        towerRotationController.setValue(params.rotation);
      }
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
      if (params.hookZ > 8) params.hookZ = 8;
      if (hookGroup) {
        hookGroup.position.z = params.hookZ;
        hookZController.setValue(params.hookZ);
      }
      break;
    case 'e': // 吊钩向后
      params.hookZ -= params.hookSpeed;
      if (params.hookZ < -6) params.hookZ = -6;
      if (hookGroup) {
        hookGroup.position.z = params.hookZ;
        hookZController.setValue(params.hookZ);
      }
      break;
    case 'w': // 吊钩上升
      params.hookY += params.hookSpeed;
      if (params.hookY > 5.6) params.hookY = 5.6;
      if (hookY) {
        hookY.position.y = params.hookY;
        hookYController.setValue(params.hookY);
      }
      break;
    case 's': // 吊钩下降
      params.hookY -= params.hookSpeed;
      if (params.hookY < 0) params.hookY = 0;
      if (hookY) {
        hookY.position.y = params.hookY;
        hookYController.setValue(params.hookY);
      }
      break;
  }
}