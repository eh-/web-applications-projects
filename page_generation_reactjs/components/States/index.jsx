import React from "react";
import "./styles.css";

/**
 * Define States, a React component of CS142 Project 4, Problem 2. The model
 * data for this view (the state names) is available at
 * window.cs142models.statesModel().
 */
class States extends React.Component {
  constructor(props) {
    super(props);
    
    this.state={
      statesModel: window.cs142models.statesModel(),
      searchText: "",
    };

    this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
  }

  handleSearchTextChange(event){
    this.setState({searchText: event.target.value});
  }

  render() {
    let statesFound = [];
    if(this.state.searchText){
      statesFound = this.state.statesModel.filter(state => state.toLowerCase().includes(this.state.searchText.toLowerCase()));
    }
    return (
    <div>
      <label className="cs142-states-input-section"> Display States: &nbsp;
        <input id="searchText" onChange={this.handleSearchTextChange}></input>
      </label>
      {this.state.searchText && 
        (
        <div className="cs142-states-result">
          <p>States with: {this.state.searchText}</p>
          {statesFound.length === 0 ? <p>No matching states</p> : <ul>{statesFound.map((s) => <li key={s}>{s}</li>)}</ul>}
        </div>
        )}
    </div>
    );
  }
}

export default States;
