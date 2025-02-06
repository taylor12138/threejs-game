import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
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
    this.plate = null; //盘子
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
    // this.initControls();
    this.addMesh();
    window.addEventListener("resize", this.windowResize.bind(this));
    window.addEventListener("wheel", this.mouseWheel.bind(this));
  }
  initScene() {
    this.scene = new THREE.Scene();
    this.setEnvMap("000");
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
    if (this.container.children.length <= 0)
      this.container.appendChild(this.renderer.domElement);
  }
  // 设置场景（环境背景）
  setEnvMap(hdr) {
    // 回调得到的参数是纹理对象
    // 怎么感觉这里的路径有点奇怪
    new RGBELoader().setPath("./hdr/").load(hdr + ".hdr", (texture) => {
      //告诉他该纹理背景是圆柱体映射
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = texture;
      this.scene.environment = texture;
    });
  }
  // 渲染函数
  render() {
    // 获取每一帧的时间差
    const delta = this.clock.getDelta();
    this.mixer && this.mixer.update(delta);
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
  setModel(modelName) {
    // 由于添加模型是异步操作，所以可以封装一个promise给它
    return new Promise((res, rej) => {
      const loader = new GLTFLoader().setPath("gltf/");
      loader.load(modelName, (gltf) => {
        console.log(gltf);
        this.model = gltf.scene.children[0];
        /* console.log(gltf);
        if (modelName === "bag2.glb" && !this.plate) {
          this.plate = gltf.scene.children[5];
          this.scene.add(this.plate);
        }
        this.scene.add(this.model);
        */

        // 把里面的scene都传进去
        this.scene.add(gltf.scene);
        //摄像头都改为模型应用的摄像头
        this.camera = gltf.cameras[0];
        //调用动画,我们可以把AnimationMixer当作一个设置好关键帧的播放器
        //这里主要还是摄像头在动,children[1]里面放一个摄像机camera
        this.mixer = new THREE.AnimationMixer(gltf.scene.children[1]);
        this.animateAction = this.mixer.clipAction(gltf.animations[0]);
        // 设置动画播放时长
        this.animateAction.setDuration(20).setLoop(THREE.LoopOnce);
        // 播放完毕停止
        this.animateAction.clampWhenFinished = true;
        this.animateAction.play();
        //设置模型内部灯光
        const spotlight1 = gltf.scene.children[2].children[0];
        spotlight1.intensity = 1;
        const spotlight2 = gltf.scene.children[3].children[0];
        spotlight2.intensity = 1;
        const spotlight3 = gltf.scene.children[4].children[0];
        spotlight3.intensity = 1;
        console.log(gltf, "again");
        res(modelName + "添加成功");
      });
    });
  }
  // 添加模型
  addMesh() {
    this.setModel("bag2.glb");
  }
  windowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    // 更新一下摄像机转换3d的矩阵
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  mouseWheel(e) {
    const timeScale = e.deltaY > 0 ? 1 : -1;
    this.animateAction.setEffectiveTimeScale(timeScale);
    this.animateAction.paused = false;
    this.animateAction.play();
    // 防抖halt
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      // 在传入的时间间隔内，通过从当前值开始逐渐降低时间比例(timeScale)使动画逐渐减速至0。
      this.animateAction.halt(0.5);
    }, 300);
  }
}
export default Base3d;
