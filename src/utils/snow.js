import * as THREE from "three";
//点云系统，我们用这个创建雪花等
function createParticle(texturePath, size = 4) {
  //创建一个缓冲几何体
  const geom = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    size: size, //粒子大小
    vertexColors: false, //不采用每个粒子的颜色
    transparent: true,
    depthWrite: false, //让黑色背景透明显示
    opacity: 0.6,
    map: new THREE.TextureLoader().load(texturePath),
    blending: THREE.AdditiveBlending, //选择附加的混合模式，模式含义为在画新像素时颜色会被添加到新像素上
    sizeAttenuation: true, //雨滴粒子远小近大
    color: new THREE.Color(0xffffff),
  });
  const positions = [];
  const velocities = []; //每个粒子偏移量
  const range = 500;
  for (let i = 0; i < 15000; i++) {
    positions.push(
      Math.random() * range - range / 2,
      Math.random() * range * 1.5,
      Math.random() * range - range / 2
    );
    velocities.push(
      (Math.random() - 0.5) / 3,
      0.1 + Math.random() / 5,
      (Math.random() - 0.5) / 3
    );
  }
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  // 自定义属性，制造动画下雨效果
  geom.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(velocities, 3)
  );
  return new THREE.Points(geom, material);
}
// 下雪效果
function snowing() {
  this.scene.children.forEach((child) => {
    if (child instanceof THREE.Points) {
      const cloud = child;
      const pos_BufferAttr = cloud.geometry.getAttribute("position");
      const vel_BufferAttr = cloud.geometry.getAttribute("velocity");
      for (let i = 0; i < pos_BufferAttr.count; i++) {
        let pos_x = pos_BufferAttr.getX(i);
        let pos_y = pos_BufferAttr.getY(i);
        let pos_z = pos_BufferAttr.getZ(i);

        let vel_x = vel_BufferAttr.getX(i);
        let vel_y = vel_BufferAttr.getY(i);
        let vel_z = vel_BufferAttr.getZ(i);

        pos_x = pos_x - vel_x;
        pos_y = pos_y - vel_y;
        pos_z = pos_z - vel_z;
        // 边界判断
        if (pos_x <= -200 || pos_x >= 200) vel_x = vel_x * -1;
        if (pos_z <= -200 || pos_z >= 200) vel_z = vel_z * -1;
        if (pos_y <= 0) pos_y = 600;
        pos_BufferAttr.setX(i, pos_x);
        pos_BufferAttr.setY(i, pos_y);
        pos_BufferAttr.setZ(i, pos_z);
        vel_BufferAttr.setX(i, vel_x);
        vel_BufferAttr.setZ(i, vel_z);
      }
      //关键代码:把两个缓冲属性的needUpdate属性设置为真,驱使threejs对刚才修改的数值进行更新
      pos_BufferAttr.needsUpdate = true;
      vel_BufferAttr.needsUpdate = true;
    }
  });
}
export { createParticle, snowing };
