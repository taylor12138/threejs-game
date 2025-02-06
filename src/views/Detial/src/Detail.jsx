import React, {useState, useEffect, useCallback} from 'react'

import Base3d from '../../../utils/Base3D';
import './Detail.css'
const list = [
  {
    title: 'GUCCI 1955',
    content: 'HORSEBIT BAG'
  },
  {
    title: 'GUCCI 1955马衔扣系列手袋',
    content: '标志性的马衔扣设计源于马术运动，由金属双环和一条衔链组合而成。'
  },
  {
    title: '手袋结构',
    content: '手袋结构设计精巧，搭配可调节长度的肩带，肩背或斜挎皆宜。'
  },
  {
    title: '向60年前古驰的经典手袋致敬。',
    content: 'Gucci 1955马衔扣系列手袋延续经典手袋线条与造型'
  }
]
export default function Detail() {
  const [data, setData] = useState({
    base3d: {},
  })
  const [descIndex, setDescIndex] = useState(0)
  const [tipList] = useState(list)

  const onMouseWheel = useCallback(() => {
    let duration = data.base3d.animateAction._clip.duration;
    let time = data.base3d.animateAction.time;
    let index = Math.floor((time / duration) * 4);
    console.log(index);
    setDescIndex(index)
  }, [data])

  useEffect(() => {
    console.log('====================================');
    console.log('执行useEffect');
    console.log('====================================');
    setData({
      base3d: new Base3d('#scene')
    })
    return () => {
    }
  }, [])
  useEffect(() => {
    console.log('====================================');
    console.log('执行useEffect2');
    console.log('====================================');
    window.addEventListener("wheel", onMouseWheel);
    return () => {
      window.removeEventListener('wheel', onMouseWheel)
    }
  }, [onMouseWheel])
  
  return (
    <div>
      <div>{tipList.map((item, index) => {
        return (
          <div className={descIndex === index ? 'tip active' : 'tip'} key={item.title}>
            <h1>{item.title}</h1>
            <p>{item.content}</p>
          </div>
        )
      })}</div>
      <div id="scene">
      </div>
    </div>
  )
}
