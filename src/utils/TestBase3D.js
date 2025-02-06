import * as THREE from "three";
//导入控制器，轨道控制器（围绕物体查看）
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { raining, createRain } from "./rain";
import { createParticle, snowing } from "./snow";

class Base3d {
  constructor(id) {
    this.container = document.querySelector(id);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
    this.animateAction = null; //gltf中的动画
    this.mixer = null; //存放 AnimationMixer
    this.clock = new THREE.Clock(); //three提供的计时器
    this.init();
    this.animate();
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
    this.setEnvMap();
    this.onLight();
    // this.createSprites();
    // this.createPoints();
    this.createRain();
    // this.createParticle();
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1500
    );
    this.camera.position.set(120, 50, 0);
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
    if (this.container.children.length <= 0)
      this.container.appendChild(this.renderer.domElement);
  }
  // 设置场景（环境背景）
  setEnvMap() {
    const BACKGROUND_COLOR = 0x000000;
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
  }
  //加载纹理图
  //"img/rain.png"
  getTexture(path) {
    return new THREE.TextureLoader().load(path);
  }
  //创建精灵材质
  createSprites() {
    for (let x = -30; x < 30; x++) {
      for (let y = -20; y < 20; y++) {
        for (let z = 0; z < 5; z++) {
          const material = new THREE.SpriteMaterial({
            opacity: 1.0,
            color: Math.random() * 0xffffff,
          });
          const sprite = new THREE.Sprite(material);
          sprite.position.set(x * 4, y * 4, z * 100);
          this.scene.add(sprite);
        }
      }
    }
  }
  // 创建点云
  createPoints() {
    //创建一个缓冲几何体
    const geom = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      size: 2, //粒子大小
      vertexColors: true, //设置顶点颜色开关是否采用缓冲几何体
      color: 0xffff,
    });
    const positions = [];
    const colors = [];
    for (let x = -30; x < 30; x++) {
      for (let y = -20; y < 20; y++) {
        for (let z = -30; z < 30; z++) {
          positions.push(x * 4, y * 4, z * 100);
          const clr = new THREE.Color(Math.random() * 0xffffff);
          colors.push(clr.r, clr.g, clr.b);
        }
      }
    }
    geom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const cloud = new THREE.Points(geom, material);
    this.scene.add(cloud);
  }
  // 创建雨滴
  createRain() {
    this.cloud = createRain.call(this);
    this.scene.add(this.cloud);
  }
  //点云系统，我们用这个创建雪花等
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
  //下雨效果动画
  raining() {
    raining.call(this);
  }
  // 下雪效果
  snowing() {
    snowing.call(this);
  }
  // 渲染函数
  render() {
    this.cloud && this.raining();
    this.cloudSnow1 && this.snowing();
    this.renderer.render(this.scene, this.camera);
  }
  // 动画函数
  animate() {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }
  //镜头控制器
  initControls() {
    // 这里我在dom中控制镜头,进行轨道移动
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }
  // 这里的gltf文件必须包含scene, cameras
  setModel() {}
  // 添加地板
  setFloor() {
    // Floor
    var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    var floorMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 0,
    });

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    this.scene.add(floor);
    var gridHelper = new THREE.GridHelper(500, 25);
    this.scene.add(gridHelper);

    //三维坐标轴
    const axes = new THREE.AxisHelper(50);
    this.scene.add(axes);
  }
  // 添加模型
  addMesh() {
    this.setModel();
    this.setFloor();
  }
  //打灯
  onLight() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
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
  windowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    // 更新一下摄像机转换3d的矩阵
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
export default Base3d;
