<script setup>
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import { onMounted, onUnmounted } from 'vue';

  let scene, camera, renderer, cube, animationFrameId, controls, mixer;
 // 添加新的变量
  let curve, progress = 0;
  // 添加键盘控制相关变量
  let speed = 0;
  let steering = 0;
  const maxSpeed = 0.1; // 最大速度
  const acceleration = 0.005; // 加速速度
  const deceleration = 0.003; // 减速速度
  const maxSteering = Math.PI * 0.007; // 最大转向角度
  const steeringSpeed = 0.08; // 转向速度
  // 初始化场景
  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
  }

  // 添加键盘状态对象
  const keys = {
    w: false,
    s: false,
    a: false,
    d: false
  };

  // 修改键盘控制函数
  const handleKeyDown = (event) => {
    const key = event.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
      keys[key] = true;
    }
  };

  const handleKeyUp = (event) => {
    const key = event.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
      keys[key] = false;
    }
  };

  // 初始化路径
  const initPath = () => {
    // 创建一个闭合的曲线路径
    const points = [
      new THREE.Vector3(-5, 0, -5),
      new THREE.Vector3(5, 0, -5),
      new THREE.Vector3(5, 0, 5),
      new THREE.Vector3(-5, 0, 5)
    ];
    curve = new THREE.CatmullRomCurve3(points);
    curve.closed = true;

    // 可视化路径（可选）
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(90));
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);
  }

  // 初始化地面
  const initPlane = () => {
    const planeSize = 1000;
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
    // controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true; // 启用阻尼效果
    // controls.dampingFactor = 0.05; // 设置阻尼系数
    // controls.screenSpacePanning = false; // 禁用屏幕空间平移
    // controls.minDistance = 1; // 设置最小缩放距离
    // controls.maxDistance = 1000; // 设置最大缩放距离
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
    loader.load('/models/car/CarConcept.gltf', (gltf) => {

      // 加载成功后的回调
      cube = gltf.scene;
      scene.add(cube);
      // 可以调整模型位置、旋转、缩放等
      cube.position.set(0, 0, 0);
      cube.scale.set(1, 1, 1);

      cube.traverse((child) => {
        if (child.name.toLowerCase().includes('wheelfront') || child.name.toLowerCase().includes('wheelrear')) {

          
          // 将车轮对象存储在自定义属性中
          child.isWheel = true;
          // 记录是否是前轮
          child.isFrontWheel = child.name.toLowerCase().includes('front');
          
          // 如果是前轮，重置其初始方向
          if (child.isFrontWheel) {
            child.rotation.x = -0;
            child.rotation.y = 0;
            child.rotation.z = -0;
          }
        }
      });

      // 创建动画混合器
      // mixer = new THREE.AnimationMixer(cube);
      
      // // 获取动画剪辑并播放
      // if (gltf.animations && gltf.animations.length) {
      //   // 遍历所有动画并播放
      //   gltf.animations.forEach((clip) => {
      //     const action = mixer.clipAction(clip);
      //     action.play();
      //   });
      // }
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

    const light = new THREE.DirectionalLight(0xffffff, 3);
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

      // 更新车辆位置
    if (cube) {
      // 处理加速和减速
      if (keys.w) {
        speed = Math.min(speed + acceleration, maxSpeed);
      } else if (keys.s) {
        speed = Math.max(speed - acceleration, -maxSpeed);
      } else {
        // 没有按键时自然减速
        if (speed > 0) speed = Math.max(0, speed - deceleration);
        if (speed < 0) speed = Math.min(0, speed + deceleration);
      }

      // 处理转向
      if (keys.a) {
        steering = Math.min(steering + steeringSpeed, maxSteering);
      } else if (keys.d) {
        steering = Math.max(steering - steeringSpeed, -maxSteering);
      } else {
        // 没有按键时方向盘自然回正
        if (steering > 0) steering = Math.max(0, steering - steeringSpeed);
        if (steering < 0) steering = Math.min(0, steering + steeringSpeed);
      }

      // 根据当前速度和转向更新车辆位置
      if (speed !== 0) {
        // 更新车辆位置
        cube.position.x += Math.sin(cube.rotation.y) * speed;
        cube.position.z += Math.cos(cube.rotation.y) * speed;
        
        // 更新车辆朝向
        cube.rotation.y += steering * (speed / maxSpeed);

        // 旋转车轮
        cube.traverse((child) => {
          if (child.isWheel) {
            // 车轮滚动
            child.rotation.x -= speed * 2;
            
            // 前轮转向
            if (child.isFrontWheel) {
              child.rotation.y = steering;
            }
          }
        });
      }

       // 更新相机位置，跟随汽车
     const cameraOffset = new THREE.Vector3(0, 5, -8); // 相机相对于汽车的偏移量
      const cameraPosition = new THREE.Vector3();
      
      // 根据汽车的旋转角度计算相机位置
      cameraPosition.copy(cube.position);
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), cube.rotation.y);
      cameraPosition.add(cameraOffset);
      
      // 平滑过渡到新的相机位置
      camera.position.lerp(cameraPosition, 0.1);
      
      // 相机始终看向汽车位置，稍微抬高一点视线
      const lookAtPosition = new THREE.Vector3();
      lookAtPosition.copy(cube.position);
      lookAtPosition.y += 1;
      camera.lookAt(lookAtPosition);

    }

    

    // 更新车辆位置
    // 汽车按照路径运动
    // if (cube && curve) {
    //   // 获取路径上的点
    //   const point = curve.getPoint(progress);
    //   cube.position.copy(point);

    //   // 计算下一个点以确定朝向
    //   const nextProgress = (progress + 0.01) % 1;
    //   const nextPoint = curve.getPoint(nextProgress);
    //   cube.lookAt(nextPoint);

    //    // 旋转车轮
    //   cube.traverse((child) => {
    //     if (child.isWheel) {
    //       // 只旋转轮子的X轴（滚动方向）
    //       child.rotation.x -= 0.1;
    //     }
    //   });

    //   // 更新进度
    //   progress = (progress + 0.001) % 1; // 调整这个值可以改变移动速度
    // }

    // 添加立方体旋转动画
    // if (cube) {
    //   // cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;
    // }
    // 更新动画混合器
    // if (mixer) {
    //   // 传入时间增量以更新动画
    //   mixer.update(0.006); // 假设 60fps，约 16ms 每帧
    // }
    
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
    // initPath(); // 添加这行
    initPlane();
    initObjects();
    initRenderer();
    animate();
    initControls();

     // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', onWindowResize);
  }

  onMounted(() => {
    main();
  })

  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
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