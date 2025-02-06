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
    this.controls = null; //控制器
    this.model = null; //模型（一个人）
    this.neck = null; //模型人物脖子
    this.waist = null; //模型人物关节
    this.possibleAnims = []; //用于存储动画剪辑的数组(除默认动画以外的所有动画剪辑)
    this.mixer = null; //混合器播放的动画所属的对象
    this.animateAction = null; //动画
    this.clock = new THREE.Clock();
    this.currentlyAnimating = false;
    this.raycaster = new THREE.Raycaster(); //threejs的光线投射，用于三维空间点击事件
    this.loaderAnim = document.getElementById("js-loader"); //loading 元素
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
    window.addEventListener("mousemove", this.windowMouseMove.bind(this));
    window.addEventListener("click", (e) => this.raycast(e));
    window.addEventListener("touchend", (e) => this.raycast(e, true));
  }
  initScene() {
    this.scene = new THREE.Scene();
    this.setEnvMap("000");
    this.onLight();
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.camera.position.set(30, 0, -3);
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
    // 设置阴影
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
  }
  // 设置场景（环境背景）
  setEnvMap() {
    const BACKGROUND_COLOR = 0xf1f1f1;
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
    this.scene.fog = new THREE.Fog(BACKGROUND_COLOR, 60, 100);
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
  // 这里的gltf文件必须包含scene, cameras
  setModel(modelName) {
    const stacy_mtl = this.initTexture();
    return new Promise((res, rej) => {
      const loader = new GLTFLoader();
      loader.load(
        modelName,
        (gltf) => {
          console.log(gltf, "gltf");
          this.loaderAnim.remove();
          this.model = gltf.scene;
          //添加阴影，调整模型材质
          this.model.traverse((o) => {
            if (o.isBone) {
              // console.log(o.name); //输出model里面包含的骨头
            }
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
              o.material = stacy_mtl; // Add this line
            }
            if (o.isBone && o.name === "mixamorigNeck") {
              this.neck = o;
            }
            if (o.isBone && o.name === "mixamorigSpine") {
              this.waist = o;
            }
          });
          // 调整模型大小
          this.model.scale.set(7, 7, 7);
          //调整模型位置
          this.model.position.y = -11;
          //取出动画
          let fileAnimations = gltf.animations;
          // 初始化动画混合器
          this.initMixer(fileAnimations);
          // 处理剩余动画
          this.leftAnimation(fileAnimations);
          this.scene.add(this.model);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    });
  }
  // 处理剩余动画
  leftAnimation(fileAnimations) {
    let clips = fileAnimations.filter((val) => val.name !== "idle");
    this.possibleAnims = clips.map((val) => {
      let clip = THREE.AnimationClip.findByName(clips, val.name);
      clip.tracks.splice(3, 3); //删除掉脊柱spine的动画
      clip.tracks.splice(9, 3); //删除掉脖子neck的动画
      clip = this.mixer.clipAction(clip);
      return clip;
    });
  }
  // 设置模型model材质
  initTexture() {
    let stacy_txt = new THREE.TextureLoader().load(
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg"
    );
    stacy_txt.flipY = false; // we flip the texture so that its the right way up
    const stacy_mtl = new THREE.MeshPhongMaterial({
      map: stacy_txt,
      color: 0xffffff,
      // skinning: true,
    });
    return stacy_mtl;
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
    floor.position.y = -11;
    this.scene.add(floor);
  }
  //添加大圆符,这是个很大但远离我们的3d球体
  setBall() {
    let geometry = new THREE.SphereGeometry(8, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); // 0xf2ce2e
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.z = -15;
    sphere.position.y = -2.5;
    sphere.position.x = -0.25;
    this.scene.add(sphere);
  }
  // 添加模型
  addMesh() {
    this.setModel(
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb"
    );
    this.setFloor();
    this.setBall();
  }
  // 初始化动画混合器
  initMixer(fileAnimations) {
    this.mixer = new THREE.AnimationMixer(this.model);
    const idleAnim = THREE.AnimationClip.findByName(fileAnimations, "idle");
    idleAnim.tracks.splice(3, 3); //删除掉脊柱spine的动画
    idleAnim.tracks.splice(9, 3); //删除掉脖子neck的动画
    this.animateAction = this.mixer.clipAction(idleAnim);
    this.animateAction.play();
  }
  // 窗口大小调整模型render大小
  windowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    // 更新一下摄像机转换3d的矩阵
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  //鼠标移动事件
  windowMouseMove(e) {
    if (this.neck && this.waist) {
      this.moveJoint({ x: e.clientX, y: e.clientY }, this.neck, 50);
      this.moveJoint({ x: e.clientX, y: e.clientY }, this.waist, 30);
    }
    return { x: e.clientX, y: e.clientY };
  }
  //控制脖子+脊椎随着鼠标扭动事件
  //参数： 当前鼠标的位置，需要移动的关节和关节允许旋转的角度值。
  moveJoint(mouse, joint, degreeLimit) {
    let degrees = this.getMouseDegrees(mouse.x, mouse.y, degreeLimit);
    //degToRad：转化未弧度
    joint.rotation.y = THREE.Math.degToRad(degrees.x);
    joint.rotation.x = THREE.Math.degToRad(degrees.y);
  }
  //打灯
  onLight() {
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    this.scene.add(hemiLight);

    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    // Add directional Light to scene
    this.scene.add(dirLight);
  }
  //一个十分复杂的控制关节角度扭动函数
  //根据当前鼠标移动的位置，返回相应的扭动角度
  getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
      dy = 0,
      xdiff,
      xPercentage,
      ydiff,
      yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };
    // Left (Rotates neck left between 0 and -degreeLimit)
    // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
      // 2. Get the difference between middle of screen and cursor position
      xdiff = w.x / 2 - x;
      // 3. Find the percentage of that difference (percentage toward edge of screen)
      xPercentage = (xdiff / (w.x / 2)) * 100;
      // 4. Convert that to a percentage of the maximum rotation we allow for the neck
      dx = ((degreeLimit * xPercentage) / 100) * -1;
    }
    // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2;
      xPercentage = (xdiff / (w.x / 2)) * 100;
      dx = (degreeLimit * xPercentage) / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      // Note that I cut degreeLimit in half when she looks up
      dy = ((degreeLimit * 0.5 * yPercentage) / 100) * -1;
    }

    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      dy = (degreeLimit * yPercentage) / 100;
    }
    return { x: dx, y: dy };
  }
  // 点击事件的射线效果
  raycast(e, touch = false) {
    var mouse = {};
    if (touch) {
      mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
    } else {
      mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
    }
    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(mouse, this.camera);

    // calculate objects intersecting the picking ray
    var intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersects[0]) {
      var object = intersects[0].object;

      if (object.name === "stacy") {
        if (!this.currentlyAnimating) {
          this.currentlyAnimating = true;
          this.playOnClick();
        }
      }
    }
  }
  // 点击事件触发,随机触发某一动画事件
  playOnClick() {
    let anim = Math.floor(Math.random() * this.possibleAnims.length) + 0;
    this.playModifierAnimation(
      this.animateAction,
      0.25,
      this.possibleAnims[anim],
      0.25
    );
  }
  //react组件中的点击事件
  playOnClickReact(name) {
    if (!this.currentlyAnimating) {
      this.currentlyAnimating = true;
      const index = this.possibleAnims.findIndex((item) => {
        return item._clip.name === name;
      });
      this.playModifierAnimation(
        this.animateAction,
        0.25,
        this.possibleAnims[index],
        0.25
      );
    }
  }
  // 从默认动画到指定动画的过渡
  playModifierAnimation(from, fSpeed, to, tSpeed) {
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    from.crossFadeTo(to, fSpeed, true);
    //设定了一个定时器，用于将当前动画恢复到 from 动画
    setTimeout(() => {
      from.enabled = true;
      to.crossFadeTo(from, tSpeed, true);
      this.currentlyAnimating = false;
    }, to._clip.duration * 1000 - (tSpeed + fSpeed) * 1000);
  }
}
export default Base3d;
