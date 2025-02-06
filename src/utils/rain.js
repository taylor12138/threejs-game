import * as THREE from "three";
// 创建雨滴
function createRain() {
  //创建一个缓冲几何体
  console.log("createrain");
  const geom = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    size: 3, //粒子大小
    vertexColors: true, //采用每个粒子的颜色
    transparent: true,
    depthWrite: false, //让黑色背景透明显示
    opacity: 0.6,
    map: new THREE.TextureLoader().load("img/rain2.png"),
    blending: THREE.AdditiveBlending, //选择附加的混合模式，模式含义为在画新像素时颜色会被添加到新像素上
    sizeAttenuation: true, //雨滴粒子远小近大
    color: new THREE.Color(0xffffff),
  });
  const positions = [];
  const colors = [];
  const velocities = []; //每个粒子偏移量
  const range = 500;
  for (let i = 0; i < 15000; i++) {
    positions.push(
      Math.random() * range - range / 2,
      Math.random() * range - range / 2,
      Math.random() * range - range / 2
    );
    velocities.push((Math.random() - 0.5) / 3, 0.1 + Math.random() / 5);
    const color = new THREE.Color(0x00eeff);
    const asHSL = {};
    color.getHSL(asHSL);
    // 颜色采用HSL色彩模式，我们对亮度采用随机值的设置
    color.setHSL(asHSL.h, asHSL.s, asHSL.l * Math.random());
    colors.push(color.r, color.g, color.b);
  }
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  // 自定义属性，制造动画下雨效果
  geom.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(velocities, 2)
  );
  return new THREE.Points(geom, material);
}
// 下雨动画效果
function raining() {
  const pos_BufferAttr = this.cloud.geometry.getAttribute("position");
  const vel_BufferAttr = this.cloud.geometry.getAttribute("velocity");
  for (let i = 0; i < pos_BufferAttr.count; i++) {
    let pos_x = pos_BufferAttr.getX(i);
    let pos_y = pos_BufferAttr.getY(i);
    let vel_x = vel_BufferAttr.getX(i);
    let vel_y = vel_BufferAttr.getY(i);
    pos_x = pos_x - vel_x;
    pos_y = pos_y - vel_y;
    // 边界判断
    if (pos_x <= -20 || pos_x >= 20) vel_x = vel_x * -1;
    if (pos_y <= 0) pos_y = 60;
    pos_BufferAttr.setX(i, pos_x);
    pos_BufferAttr.setY(i, pos_y);
    vel_BufferAttr.setX(i, vel_x);
  }
  //关键代码:把两个缓冲属性的needUpdate属性设置为真,驱使threejs对刚才修改的数值进行更新
  pos_BufferAttr.needsUpdate = true;
  vel_BufferAttr.needsUpdate = true;
}
export { raining, createRain };
