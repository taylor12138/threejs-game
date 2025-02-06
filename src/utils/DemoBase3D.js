import * as THREE from "three";
//导入控制器，轨道控制器（围绕物体查看）
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
// 导入模型解析器
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// 下雨下雪函数
import { raining, createRain } from "./rain";
import { createParticle, snowing } from "./snow";
//模型控制器
import { CharacterControls } from "./charactor.ts";

class Base3d {
  constructor(id, charactorName) {
    this.charactorName = charactorName; //角色名字
    this.container = document.querySelector(id);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.orbitControls = null; //控制器
    this.model = null; //模型
    this.mixer = null; //混合器播放的动画所属的对象
    this.animationsMap = new Map(); //用于存储模型动画
    this.dragonModel = null; //巨龙模型
    this.dragonMixer = null; //巨龙混合器
    this.wolfModel = null; //战狼模型
    this.wolfMixer = null; //战狼混合器
    this.titanModel = null; //巨人模型
    this.keysPressed = {}; //记录按下的键位
    this.loaderAnim = document.getElementById("js-loader"); //loading 元素
    this.valid = true; //动画的节流阀
    this.init();
    this.animate();
    this.clock = new THREE.Clock();
  }
  init() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.addMesh();
    document.addEventListener("keydown", this.keyDown.bind(this));
    document.addEventListener("keyup", this.keyUp.bind(this));
  }
  initScene() {
    this.scene = new THREE.Scene();
    this.setEnvMap();
    this.onLight();
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1500
    );
    this.camera.position.set(0, 60, 150);
  }
  initRenderer() {
    //可以设置抗锯齿 antialias
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    //设置像素比,window.devicePixelRatio为当前浏览器的像素比
    this.renderer.setPixelRatio(window.devicePixelRatio);
    //渲染尺寸大小
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //色调映射（常量），设置为电影级别
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //调节曝光程度
    this.renderer.toneMappingExposure = 1;
    // 设置阴影
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
  }
  //镜头控制器
  initControls() {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
  }
  // 添加模型
  addMesh() {
    this.setFloor();
    this.setModel();
  }
  // 设置场景
  setEnvMap() {
    this.scene.background = new THREE.Color(0xf1f1f1);
  }
  // 设置迷雾
  setFog() {
    this.scene.fog = new THREE.Fog(0xf1f1f1, 50, 300);
  }
  // 设置下雨
  setRain() {
    this.cloud = createRain.call(this);
    this.scene.add(this.cloud);
  }
  // 设置下雪
  setSnow() {
    this.createParticle();
  }
  //下雪场景的点云系统
  createParticle() {
    this.cloudSnow1 = createParticle.call(this, "img/snowflakes1.png");
    this.cloudSnow2 = createParticle.call(this, "img/snowflakes2.png");
    this.cloudSnow3 = createParticle.call(this, "img/snowflakes3.png");
    this.cloudSnow4 = createParticle.call(this, "img/snowflakes4.png");
    this.scene.add(this.cloudSnow1);
    this.scene.add(this.cloudSnow2);
    this.scene.add(this.cloudSnow3);
    this.scene.add(this.cloudSnow4);
  }
  //取消所有环境
  cancelAllEnv() {
    this.scene.remove(this.cloud);
    this.scene.remove(this.cloudSnow1);
    this.scene.remove(this.cloudSnow2);
    this.scene.remove(this.cloudSnow3);
    this.scene.remove(this.cloudSnow4);
    this.cloud = null;
    this.cloudSnow1 = null;
    this.cloudSnow2 = null;
    this.cloudSnow3 = null;
    this.cloudSnow4 = null;
    this.scene.fog = null;
  }
  //打灯
  onLight() {
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    hemiLight.position.set(0, 100, 0);
    // Add hemisphere light to scene
    this.scene.add(hemiLight);

    let d = 200;
    let dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(50, 200, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    this.scene.add(dirLight);
  }
  // 设置模型
  //（fbx）
  // setModel() {
  //   const loader = new FBXLoader().setPath(`fbx/${this.charactorName}/`);
  //   return new Promise((res, rej) => {
  //     loader.load(
  //       "people.fbx",
  //       (fbx) => {
  //         console.log(fbx, "fbx");
  //         // this.loaderAnim.remove();
  //         fbx.scale.setScalar(0.3);
  //         this.model = fbx;
  //         this.model.position.y = -10;
  //         this.model.rotation.y = Math.PI / 2;
  //         // 添加阴影
  //         this.model.traverse((o) => {
  //           if (o.isMesh) {
  //             o.castShadow = true;
  //             o.receiveShadow = true;
  //           }
  //         });
  //         this.scene.add(this.model);
  //         res();
  //       },
  //       undefined,
  //       function (error) {
  //         console.error(error);
  //       }
  //     );
  //   });
  // }
  setModel() {
    const loader = new GLTFLoader().setPath(`model/`);
    return new Promise((res, rej) => {
      loader.load(
        "blue-knife.gltf",
        (gltf) => {
          console.log(gltf, "gltf");
          this.model = gltf.scene;
          const gltfAnimations = gltf.animations;
          this.mixer = new THREE.AnimationMixer(this.model);
          gltfAnimations
            .filter((a) => a.name !== "mixamo.com")
            .forEach((a) => {
              this.animationsMap.set(a.name, this.mixer.clipAction(a));
            });
          this.model.scale.set(0.5, 0.5, 0.5);
          this.model.position.y = 35;
          this.model.rotation.y = Math.PI / 2;
          this.model.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          this.scene.add(this.model);
          //角色控制器
          this.characterControls = new CharacterControls(
            this.model,
            this.mixer,
            this.animationsMap,
            this.orbitControls,
            this.camera,
            "Idle"
          );
          res();
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    });
  }
  //设置巨龙模型
  setDragonModel() {
    const loader = new GLTFLoader().setPath(`gltf/dragon/`);
    return new Promise((res, rej) => {
      loader.load(
        "scene.gltf",
        (gltf) => {
          console.log("dragon", gltf);
          this.dragonModel = gltf.scene;
          this.dragonModel.scale.set(50, 50, 50);
          this.dragonModel.position.y = -15;
          this.dragonModel.position.x = -10;
          this.dragonModel.rotation.y = Math.PI / 2;
          // 添加阴影
          this.dragonModel.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          //动画
          this.dragonMixer = new THREE.AnimationMixer(this.dragonModel);
          const tampAnimateAction = this.dragonMixer.clipAction(
            gltf.animations[0]
          );
          tampAnimateAction.play();
          this.scene.add(this.dragonModel);
          res();
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    });
  }
  // 设置战狼模型
  setWolf() {
    const loader = new GLTFLoader().setPath(`gltf/wolf/`);
    return new Promise((res, rej) => {
      loader.load(
        "scene.gltf",
        (gltf) => {
          console.log(gltf, "wolf");
          this.wolfModel = gltf.scene;
          this.wolfModel.scale.set(0.4, 0.4, 0.4);
          this.wolfModel.position.y = -10;
          this.wolfModel.position.z = 70;
          this.wolfModel.position.x = 40;
          this.wolfModel.rotation.y = Math.PI / 2;
          // 添加阴影
          this.wolfModel.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          //动画
          this.wolfMixer = new THREE.AnimationMixer(this.wolfModel);
          const tampAnimateAction = this.wolfMixer.clipAction(
            gltf.animations[0]
          );
          tampAnimateAction.play();
          this.scene.add(this.wolfModel);
          res();
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    });
  }
  //设置始祖巨人
  setTitan() {
    const loader = new GLTFLoader().setPath(`gltf/titan/`);
    return new Promise((res, rej) => {
      loader.load(
        "scene.gltf",
        (gltf) => {
          console.log(gltf, "titan");
          this.titanModel = gltf.scene;
          this.titanModel.scale.set(10, 10, 10);
          this.titanModel.position.y = -10;
          this.titanModel.position.x = 10;
          this.titanModel.rotation.y = Math.PI / 2;
          // 添加阴影
          this.titanModel.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          this.scene.add(this.titanModel);
          res();
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    });
  }

  // //设置动画(fbx)
  // setAnimationAction(name) {
  //   const loader = new FBXLoader().setPath(
  //     `fbx/${this.charactorName}/actions/`
  //   );
  //   loader.load(`${name}.fbx`, (anim) => {
  //     const m = new THREE.AnimationMixer(this.model);
  //     this.mixer = m;
  //     this.animateAction = m.clipAction(anim.animations[0]);
  //     this.animateAction.play();
  //   });
  // }
  //设置 / 切换动画（new）
  setAnimationAction(name) {
    if (this.characterControls && this.valid) {
      this.valid = false;
      this.characterControls.play = name;
      setTimeout(() => {
        this.valid = true;
      }, 1000);
    }
  }
  // 渲染函数
  render() {
    const delta = this.clock.getDelta();
    if (this.characterControls) {
      this.characterControls.update(delta, this.keysPressed);
    }
    this.mixer && this.mixer.update(delta);
    this.dragonMixer && this.dragonMixer.update(delta);
    this.wolfMixer && this.wolfMixer.update(delta);
    this.cloud && raining.call(this);
    this.cloudSnow1 && snowing.call(this);
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  }
  // 动画函数
  animate() {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }
  // 添加地板
  setFloor() {
    const HEIGH = -10;
    const textureLoader = new THREE.TextureLoader();
    const sandBaseColor = textureLoader.load(
      "textures/sand/Sand 002_COLOR.jpg"
    );
    const sandNormalMap = textureLoader.load("textures/sand/Sand 002_NRM.jpg");
    const sandHeightMap = textureLoader.load("textures/sand/Sand 002_DISP.jpg");
    const sandAmbientOcclusion = textureLoader.load(
      "textures/sand/Sand 002_OCC.jpg"
    );
    // Floor
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    var floorMaterial = new THREE.MeshStandardMaterial({
      map: sandBaseColor,
      normalMap: sandNormalMap,
      displacementMap: sandHeightMap,
      displacementScale: 0.1,
      aoMap: sandAmbientOcclusion,
    });
    this.wrapAndRepeatTexture(floorMaterial.map);
    this.wrapAndRepeatTexture(floorMaterial.normalMap);
    this.wrapAndRepeatTexture(floorMaterial.displacementMap);
    this.wrapAndRepeatTexture(floorMaterial.aoMap);

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = HEIGH;
    this.scene.add(floor);

    // var gridHelper = new THREE.GridHelper(500, 25);
    // gridHelper.position.y = HEIGH;
    // this.scene.add(gridHelper);

    //三维坐标轴
    const axes = new THREE.AxisHelper(50);
    this.scene.add(axes);
  }
  wrapAndRepeatTexture(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.x = map.repeat.y = 10;
  }
  //键盘按下事件
  keyDown(event) {
    this.keysPressed[event.key.toLowerCase()] = true;
  }
  //键盘松开事件
  keyUp(event) {
    this.keysPressed[event.key.toLowerCase()] = false;
  }
}
export default Base3d;
