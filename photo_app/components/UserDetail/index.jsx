import React from "react";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";
import axios from 'axios';

/**
 * Define UserDetail, a React component of CS142 Project 5.
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currUser: null
    };
    this.fetchUserDetails.call(this);
  }

  componentDidUpdate(prevProps){
    if(prevProps.match.params.userId !== this.props.match.params.userId){
      this.fetchUserDetails.call(this);
    }
  }

  fetchUserDetails(){
    axios.get(`/user/${this.props.match.params.userId}`).then(response => {
      this.setState({
        currUser: response.data,
      }, function(){
        this.props.changeSecondaryTitle(`${this.state.currUser.first_name} ${this.state.currUser.last_name}`);
      });
    }).catch(error => {
      console.log(error.message);
      this.setState({currUser: null});
    });
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
