import React, { useState, useEffect, useCallback } from "react";
import "css-doodle";

import "./Demo.css";
import Base3d from "../../../utils/DemoBase3D.js";
const actions = [
  {
    name: "Attack",
    china: "普通攻击",
  },
  {
    name: "Dancing",
    china: "跳舞",
  },
  {
    name: "Falling",
    china: "摔倒",
  },
  {
    name: "Jump",
    china: "原地起飞",
  },
  {
    name: "Praying",
    china: "投降",
  },
  {
    name: "Other",
    china: "额外技能",
  },
  {
    name: "Final",
    china: "必杀技",
  },
];
const charactors = [
  "archer",
  "blue-knife",
  "funny",
  "knight",
  "one-eyed",
  "solider",
];
const environment = ["正常模式", "迷雾模式", "雨中模式", "大雪模式"];
export default function Demo() {
  const [IsEnter, setIsEnter] = useState(false);
  // 防止重复设置
  const [IsDragon, setIsDragon] = useState(false);
  const [IsWolf, setIsWolf] = useState(false);
  const [IsTitan, setIsTitan] = useState(false);

  const [data, setData] = useState({
    base3d: {},
  });
  const [BoardList] = useState(actions);
  const [Env, setEnv] = useState(0);
  const [CurrentIndex, setCurrentIndex] = useState(0);

  // 转换环境
  const turnEnv = useCallback(
    (index) => () => {
      if (!data.base3d) return;
      data.base3d.cancelAllEnv();
      setEnv(index);
      switch (index) {
        case 1:
          data.base3d.setFog();
          break;
        case 2:
          data.base3d.setRain();
          break;
        case 3:
          data.base3d.setSnow();
          break;
        default:
          break;
      }
    },
    [data.base3d]
  );

  // 设置巨龙
  const setDragon = useCallback(() => {
    if (!data.base3d || IsDragon) return;
    data.base3d.setDragonModel();
    setIsDragon(true);
  }, [data.base3d, IsDragon]);
  // 设置战狼
  const setWolf = useCallback(() => {
    if (!data.base3d || IsWolf) return;
    data.base3d.setWolf();
    setIsWolf(true);
  }, [data.base3d, IsWolf]);
  // 设置巨人
  const setTitan = useCallback(() => {
    console.log(11);
    if (!data.base3d || IsTitan) return;
    data.base3d.setTitan();
    setIsTitan(true);
    console.log(221);
  }, [data.base3d, IsTitan]);
  // 使用角色技能
  const clickSkillOption = useCallback(
    (name) => {
      return () => {
        if (!data.base3d) return;
        data.base3d.setAnimationAction(name);
      };
    },
    [data.base3d]
  );
  // 选择角色
  const chooseCharactor = useCallback(() => {
    setData({
      base3d: new Base3d("#demo", charactors[CurrentIndex]),
    });
    setIsEnter(true);
  }, [CurrentIndex]);

  useEffect(() => {
    console.log("====================================");
    console.log("执行useEffect", IsEnter);
    console.log("====================================");
    return () => {};
  }, [IsEnter]);

  return (
    <div className="demo" id="demo">
      {IsEnter ? (
        <div>
          <div className="board">
            {BoardList.map((item) => {
              return (
                <div
                  className="action"
                  key={item.name}
                  onClick={clickSkillOption(item.name)}
                >
                  {item.china}
                </div>
              );
            })}
          </div>
          <div className="env">
            {environment.map((item, index) => (
              <div className="option" onClick={turnEnv(index)} key={item}>
                {item}
              </div>
            ))}
            <div className="option" onClick={setDragon}>
              生成巨龙
            </div>
            <div className="option" onClick={setWolf}>
              生成战狼
            </div>
            <div className="option" onClick={setTitan}>
              生成始祖巨人
            </div>
          </div>
        </div>
      ) : (
        <div>
          <css-doodle>
            {`@grid: 50x1 / 50vmin;
    :container {
      perspective: 23vmin;
    }
    background: @m(
      @r(200, 240), 
      radial-gradient(
        @p(#00b8a9, #f8f3d4, #f6416c, #ffde7d) 15%,
        transparent 50%
      ) @r(100%) @r(100%) / @r(1%, 3%) @lr no-repeat
    );

    @size: 80%;
    @place-cell: center;

    border-radius: 50%;
    transform-style: preserve-3d;
    animation: scale-up 20s linear infinite;
    animation-delay: calc(@i * -.4s);

    @keyframes scale-up {
      0% {
        opacity: 0;
        transform: translate3d(0, 0, 0) rotate(0);
      }
      10% { 
        opacity: 1; 
      }
      95% {
        transform:
          translate3d(0, 0, @r(50vmin, 55vmin))
          rotate(@r(-360deg, 360deg));
      }
      100% {
        opacity: 0;
        transform: translate3d(0, 0, 1vmin);
      }
    }`}
          </css-doodle>
          <div className="charactors">
            <div className="options">
              {charactors.map((item, index) => {
                return (
                  <div
                    key={item}
                    className={
                      index === CurrentIndex ? "option active" : "option"
                    }
                    onClick={() => {
                      setCurrentIndex(index);
                    }}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
            <div className="title-choose" onClick={chooseCharactor}>
              Choose Your Charactor
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
