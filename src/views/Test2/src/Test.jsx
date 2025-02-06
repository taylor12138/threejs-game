import React, { useState, useEffect } from 'react'

import Base3d from '../../../utils/Base3D_3';
import './Test.css'

const actions = [
  {
    name: 'pockets',
    china: '摸口袋'
  },
  {
    name: 'rope',
    china: '跳绳'
  },
  {
    name: 'swingdance',
    china: '跳舞'
  },
  {
    name: 'jump',
    china: '原地起飞'
  },
  {
    name: 'react',
    china: '受到惊吓'
  },
  {
    name: 'shrug',
    china: '就这？'
  },
  {
    name: 'wave',
    china: '再见'
  },
  {
    name: 'golf',
    china: '打高尔夫'
  },
]
export default function Test2() {
  const [data, setData] = useState({
    base3d: {},
  })
  const [BoardList] = useState(actions)
  const clickAnimationOption = (name) => {
    return () => {
      data.base3d && data.base3d.playOnClickReact(name)
    }
  }
  useEffect(() => {
    console.log('====================================');
    console.log('执行useEffect');
    console.log('====================================');
    setData({
      base3d: new Base3d('#c')
    })
    return () => {
    }
  }, [])
  return (
    <div className='test'>
      <div className="loading" id="js-loader"><div className="loader" />
      </div>
      <div className="wrapper">
        <div id="c"></div>
      </div>
      <div className="board">
        {BoardList.map(item => {
          return (
            <div className='action' onClick={clickAnimationOption(item.name)}
            key={item.name}>{item.china}</div>
          )
        })}
      </div>
    </div>
    
  )
}
