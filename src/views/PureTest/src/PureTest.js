import React, { useState, useEffect } from "react";
import Base3d from "../../../utils/TestBase3D";

export default function PureTest() {
  const [data, setData] = useState({
    base3d: {},
  });
  useEffect(() => {
    console.log("====================================");
    console.log("执行useEffect");
    console.log("====================================");
    setData({
      base3d: new Base3d("#scene"),
    });
    return () => {};
  }, []);
  return <div id="scene"></div>;
}
