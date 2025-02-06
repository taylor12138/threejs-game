import * as THREE from "three";
//导入控制器，轨道控制器（围绕物体查看）
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 导入模型解析器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Base3d {
  constructor(id) {
    this.container = document.querySelector(id);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
    this.init();
    this.animate();
    this.option = "legs";
    this.loaded = false; //旋转动画停止
    this.initRotate = 0; //旋转次数
    this.child = null;
  }
  init() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.addMesh();
    window.addEventListener("resize", this.windowResize.bind(this));
  }
  initScene() {
    this.scene = new THREE.Scene();
    this.setEnvMap("000");
    this.onLight();
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.25,
      200
    );
    this.camera.position.set(-1.8, 0.6, 2.7);
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
    this.renderer.toneMappingExposure = 2;
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
  }
  // 设置场景（环境背景）
  setEnvMap() {
    const BACKGROUND_COLOR = 0xf1f1f1;
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
    this.scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);
  }
  // 渲染函数
  render() {
    this.renderer.render(this.scene, this.camera);
    if (this.model !== null && this.loaded === false) {
      this.initialRotation();
    }
  }
  // 动画函数
  animate() {
    this.controls.update();
    this.render();
    this.renderer.setAnimationLoop(this.render.bind(this));
  }
  //镜头控制器
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minPolarAngle = Math.PI / 3;
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.dampingFactor = 0.1;
    this.controls.autoRotate = false; //
    this.controls.autoRotateSpeed = 0.2; // 30
  }
  // 旋转动画
  initialRotation() {
    this.initRotate++;
    if (this.initRotate <= 120) {
      this.model.rotation.y += Math.PI / 60;
    } else {
      this.loaded = true;
    }
  }
  // 初始化添加的模型材质
  initColor(parent, type, mtl) {
    parent.traverse((o) => {
      if (o.isMesh) {
        if (o.name.includes(type)) {
          o.material = mtl;
          o.nameID = type; // Set a new property to identify this object
        }
      }
    });
  }
  //设置椅子xx部分的颜色
  setMaterial(parent, type, mtl) {
    parent.traverse((o) => {
      if (o.isMesh && o.nameID != null) {
        if (o.nameID === type) {
          o.material = mtl;
        }
      }
    });
  }
  // 改变颜色回调
  clickChangeColor(color) {
    let new_mtl;
    if (color.texture) {
      let txt = new THREE.TextureLoader().load(color.texture);
      txt.repeat.set(color.size[0], color.size[1], color.size[2]);
      txt.wrapS = THREE.RepeatWrapping;
      txt.wrapT = THREE.RepeatWrapping;
      new_mtl = new THREE.MeshPhongMaterial({
        map: txt,
        shininess: color.shininess ? color.shininess : 10,
      });
    } else {
      new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt("0x" + color.color),
        shininess: color.shininess ? color.shininess : 10,
      });
    }
    this.setMaterial(this.model, this.option, new_mtl);
  }
  // 改变option回调
  clickChangeOption(option) {
    this.option = option;
  }
  // 这里的gltf文件必须包含scene, cameras
  setModel(modelName) {
    const INITIAL_MTL = new THREE.MeshPhongMaterial({
      color: 0xf3f1f1,
      shininess: 10,
    });

    const INITIAL_MAP = [
      { childID: "back", mtl: INITIAL_MTL },
      { childID: "base", mtl: INITIAL_MTL },
      { childID: "cushions", mtl: INITIAL_MTL },
      { childID: "legs", mtl: INITIAL_MTL },
      { childID: "supports", mtl: INITIAL_MTL },
    ];

    return new Promise((res, rej) => {
      const loader = new GLTFLoader();
      loader.load(
        modelName,
        (gltf) => {
          this.model = gltf.scene;
          // 添加阴影
          this.model.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          this.model.scale.set(2, 2, 2);
          // 设置椅子正对着我们
          this.model.rotation.y = Math.PI;
          this.model.position.y = -1;
          // 加入初始化的材质
          for (let object of INITIAL_MAP) {
            this.initColor(this.model, object.childID, object.mtl);
          }
          this.scene.add(this.model);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    });
  }
  // 添加地板
  setFloor() {
    // Floor
    var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    var floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      shininess: 0,
    });

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -1;
    this.scene.add(floor);
  }
  // 添加模型
  addMesh() {
    this.setModel(
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb"
    );
    this.setFloor();
  }
  windowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    // 更新一下摄像机转换3d投影的矩阵
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  //打灯
  onLight() {
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    this.scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    // Add directional Light to this.scene
    this.scene.add(dirLight);

    //辅助函数
    const lightHelper = new THREE.DirectionalLightHelper(dirLight);
    const shadowCameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
    this.scene.add(lightHelper);
    this.scene.add(shadowCameraHelper);
  }
}
export default Base3d;
