import React from "react";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";

/**
 * Define UserDetail, a React component of CS142 Project 5.
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currUser: window.cs142models.userModel(this.props.match.params.userId),
    };
    this.props.changeSecondaryTitle(`${this.state.currUser.first_name} ${this.state.currUser.last_name}`);
  }

  componentDidUpdate(prevProps){
    if(prevProps.match.params.userId !== this.props.match.params.userId){
      this.setState({currUser: window.cs142models.userModel(this.props.match.params.userId)}, () => {
        this.props.changeSecondaryTitle(`${this.state.currUser.first_name} ${this.state.currUser.last_name}`);
      });
    }
  }

  render() {
    if(!this.state.currUser) return "";
    return (
      <Typography variant="body1">
        Name: {" "} {this.state.currUser.first_name + " " + this.state.currUser.last_name}
        <br />
        Location: {" "} {this.state.currUser.location}
        <br />
        Occupation: {" "} {this.state.currUser.occupation}
        <br />
        {this.state.currUser.description}
        <br />
        <Link to={`/photos/${this.state.currUser._id}`}>Photos</Link>
      </Typography>
    );
  }
}

export default UserDetail;
