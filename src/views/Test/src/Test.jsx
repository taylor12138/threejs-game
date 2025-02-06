import React, { useState, useEffect, useRef, useCallback } from 'react'

import Base3d from '../../../utils/Base3D_2';
import './Test.css'

const colors = [
  {
      texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/wood.jpg',
      size: [2,2,2],
      shininess: 60
  },
  {
      texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/denim.jpg',
      size: [3, 3, 3],
      shininess: 0
  },
  {
    color: '66533C',
  },
  {
      color: '173A2F'
  },
  {
      color: '153944'
  },
  {
      color: '27548D'
  },
  {
      color: '438AAC'
  }  
]

const options = [
  {
    name:'legs',
    imgSrc:'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/legs.svg'
  },
  {
    name:'cushions',
    imgSrc:'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/cushions.svg'
  },
  {
    name:'base',
    imgSrc:'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/base.svg'
  },
  {
    name:'supports',
    imgSrc:'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/supports.svg'
  },
  {
    name:'back',
    imgSrc:'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/back.svg'
  },
]
export default function Test(props) {
  const [data, setData] = useState({
    base3d: {},
  })
  const [List] = useState([...colors])
  const TrayRef = useRef(null)
  const [CurrentOption, setCurrentOption] = useState(0)

  const selectSwatch = useCallback((e) => {
    let color = colors[parseInt(e.target.dataset.key)];
    console.log(color, e.target);
    data.base3d.clickChangeColor(color)
  }, [data.base3d])

  const clickOptions = (index, option) => {
    return () => {
      setCurrentOption(index)
      data.base3d.clickChangeOption(option)
    }
  }

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
  
  
  return (
    <div className='test'>
      <div id="scene">
      </div>
      <div className="controls">
        <div id="js-tray" className="tray">
          <div id="js-tray-slide" className="tray__slide" ref={TrayRef}>
            {List.map((item, index) => {
              if(!item.texture)return (
                <div className='tray__swatch' style={{background: `#${item.color}`}}
                  data-key={index} key={item.color} onClick={selectSwatch}></div>
              )
              return (<div className='tray__swatch'
                data-key={index} key={item.texture} onClick={selectSwatch}>
              </div>)
            })}
          </div>
        </div>
      </div>
      <div className="options">
        {options.map((item, index) => {
          return (
            <div className={CurrentOption === index ? "option active-option" : "option"}
              data-option={item.name} onClick={clickOptions(index, item.name)} key={item.name}>
              <img src={item.imgSrc} alt=""/>
            </div>
          )
        })}
      </div>
    </div>
  )
}
