import React from "react";
import ReactDOM from "react-dom";

import States from "./components/States";
import Header from "./components/Header";
import Example from "./components/Example";

class Switch extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showExample: true,
        };

        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    handleButtonClick(){
        this.setState({showExample: !this.state.showExample});
    }

    render(){
        return (
        <div>
            <button onClick={this.handleButtonClick}>Switch to {this.state.showExample ? "States" : "Example"}</button>
            {this.state.showExample ? <Example /> : <States />}
        </div>
        );
    }
}

ReactDOM.render(
  <div>
    <Header />
    <Switch /> 
  </div>, 
  document.getElementById("reactapp"));
