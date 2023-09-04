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
      currUser: null,
      most_recent_photo: null,
      most_comment_photo: null,
      mentions: [],
    };
    this.fetchUserDetails.call(this);
  }

  componentDidUpdate(prevProps){
    if(prevProps.match.params.userId !== this.props.match.params.userId){
      this.fetchUserDetails.call(this);
    }
  }

  fetchUserDetails(){
    axios.get(`/user/${this.props.match.params.userId}`).then(user_info => {
      axios.get(`/mostRecentPhoto/${this.props.match.params.userId}`).then(most_recent_photo => {
        axios.get(`/mostCommentPhoto/${this.props.match.params.userId}`).then(most_comment_photo => {
          axios.get(`/mentionPhotos/${this.props.match.params.userId}`).then(mentions => {
            this.setState({
              currUser: user_info.data,
              most_recent_photo: most_recent_photo.data, 
              most_comment_photo: most_comment_photo.data,
              mentions: mentions.data,
            }, function(){
              this.props.changeSecondaryTitle(`${this.state.currUser.first_name} ${this.state.currUser.last_name}`);
            });
          }).catch(err => {
            console.log(`${err.response.status}: ${err.response.data}`);
            this.setState({
              currUser: null,
              most_recent_photo: null,
              most_comment_photo: null,
              mentions: [],
            });
          });
        }).catch(err => {
          console.log(`${err.response.status}: ${err.response.data}`);
          this.setState({
            currUser: null,
            most_recent_photo: null,
            most_comment_photo: null,
            mentions: [],
          });
        });
      }).catch(err => {
        console.log(`${err.response.status}: ${err.response.data}`);
        this.setState({
          currUser: null,
          most_recent_photo: null,
          most_comment_photo: null,
          mentions: [],
        });
      });
    }).catch(err => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.setState({
        currUser: null,
        most_recent_photo: null,
        most_comment_photo: null,
        mentions: [],
      });
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
        {this.state.most_recent_photo && (
          <Box sx={{mt: 1}}>
            <Typography variant="body1">
              Recently Uploaded: {new Date(this.state.most_recent_photo.date_time).toDateString()}
            </Typography>
            <Box sx={{height: 50, width: 50}}>
              <Link to={`/photos/${this.state.currUser._id}`}>
                <img style={{ height: '100%'}} 
                  src={`/images/${this.state.most_recent_photo.file_name}`}
                />
              </Link>
            </Box>
          </Box>
        )}
        
        {this.state.most_comment_photo && (
          <Box sx={{mt: 1}}>
            <Typography variant="body1">
              Most Comments: {this.state.most_comment_photo.comment_count}
            </Typography>
            <Box sx={{height: 50, width: 50}}>
              <Link to={`/photos/${this.state.currUser._id}`}>
                <img style={{ height: '100%'}} 
                  src={`/images/${this.state.most_comment_photo.file_name}`}
                />
              </Link>
            </Box>
          </Box>
        )}
        
        {this.state.mentions.length !== 0 ? (
          <Box sx={{mt: 1}}>
            <Typography variant="body1">
              Mentions:
            </Typography>
            {this.state.mentions.map(mention => (
              <Box key={mention._id}>
                <Link to={`/users/${mention.uploader_id}`}>
                  <Typography variant="body1">
                    {`${mention.uploader_first_name} ${mention.uploader_last_name}`}
                  </Typography>
                </Link>
                <Box sx={{height:50, width: 50}}>
                  <Link to={`/photos/${mention.uploader_id}`}>
                    <img style={{height: '100%'}}
                      src={`/images/${mention.file_name}`}
                    />
                  </Link>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{mt: 1}}>
            <Typography variant="body1">
              No Mentions
            </Typography>
          </Box>
        )}
        
      </Box>
    );
  }
}

export default UserDetail;
