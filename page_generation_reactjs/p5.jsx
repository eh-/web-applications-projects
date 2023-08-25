import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Link } from "react-router-dom";

import States from "./components/States";
import Header from "./components/Header";
import Example from "./components/Example";


ReactDOM.render(
  <div>
    <Header />
    
    <HashRouter>
        <Link to="/states" className="cs142-p5-button">States</Link>
        &nbsp;
        <Link to="/example" className="cs142-p5-button">Example</Link>
        <Route path="/states" component={States} />
        <Route path="/example" component={Example} />
    </HashRouter>
  </div>, 
  document.getElementById("reactapp"));
