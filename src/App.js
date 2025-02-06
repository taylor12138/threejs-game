import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Detail from "./views/Detial";
import Demo from "./views/Demo";
import Test from "./views/Test";
import Test2 from "./views/Test2";
import PureTest from "./views/PureTest";

export default function App() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <BrowserRouter>
        <Switch>
          <Route path="/detail" component={Detail}></Route>
          <Route path="/demo" component={Demo}></Route>
          <Route path="/test" component={Test}></Route>
          <Route path="/test2" component={Test2}></Route>
          <Route path="/test3" component={PureTest}></Route>
          <Redirect from="/" to="/demo" exact />
        </Switch>
      </BrowserRouter>
    </div>
  );
}
