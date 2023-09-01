import React from "react";
import { Typography, Box } from "@mui/material";
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
      <Box>
        <Typography variant="body1">
          Name: {" "} {this.state.currUser.first_name + " " + this.state.currUser.last_name}
          <br />
          {this.state.currUser.location && (`Location: ${this.state.currUser.location}`)}
          {this.state.currUser.location && (<br />)}
          {this.state.currUser.occupation && (`Occupation: ${this.state.currUser.occupation}`)}
          {this.state.currUser.occupation && (<br />)}
          {this.state.currUser.description && (`${this.state.currUser.description}`)}
          {this.state.currUser.description && (<br />)}

          <Link to={`/photos/${this.state.currUser._id}`}>Photos</Link>
          <br />
        </Typography>
        {this.state.currUser.most_recent_upload && (
          <Box sx={{mt: 1}}>
            <Typography variant="body1">
              Recently Uploaded: {new Date(this.state.currUser.most_recent_upload.date_time).toDateString()}
            </Typography>
            <Box sx={{height: 50, width: 50}}>
              <Link to={`/photos/${this.state.currUser._id}`}>
                <img style={{ height: '100%'}} 
                  src={`/images/${this.state.currUser.most_recent_upload.file_name}`}
                />
              </Link>
            </Box>
          </Box>
        )}
        
        {this.state.currUser.most_comment_upload && (
          <Box sx={{mt: 1}}>
            <Typography variant="body1">
              Most Comments: {this.state.currUser.most_comment_upload.comment_count}
            </Typography>
            <Box sx={{height: 50, width: 50}}>
              <Link to={`/photos/${this.state.currUser._id}`}>
                <img style={{ height: '100%'}} 
                  src={`/images/${this.state.currUser.most_comment_upload.file_name}`}
                />
              </Link>
            </Box>
          </Box>
        )}
        
      </Box>
    );
  }
}

export default UserDetail;
