import React from "react";
import { 
  Typography, 
  Grid, 
  Card, 
  CardHeader, 
  CardMedia, 
  CardContent, 
} from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";

/**
 * Define UserPhotos, a React component of CS142 Project 5.
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      photosOfUser: window.cs142models.photoOfUserModel(this.props.match.params.userId),
      userInfo: window.cs142models.userModel(this.props.match.params.userId),
    };
    this.props.changeSecondaryTitle(`Photos Of ${this.state.userInfo.first_name} ${this.state.userInfo.last_name}`);
  }

  componentDidUpdate(prevProps){
    if(prevProps.match.params.userId !== this.props.match.params.userId){
      this.setState({
        photosOfUser: window.cs142models.photoOfUserModel(this.props.match.params.userId),
        userInfo: window.cs142models.userModel(this.props.match.params.userId),
      }, () => {
        this.props.changeSecondaryTitle(`Photos Of ${this.state.userInfo.first_name} ${this.state.userInfo.last_name}`);
      });
    }
  }

  render() {
    if(this.state.userInfo === null) return "";
    return (
      <Grid container justify="space-evenly" alignItems="flex-start">
        {this.state.photosOfUser && this.state.photosOfUser.map((photo) => (
          <Grid item xs={12} key={photo._id}>
            <Card>
              <CardHeader title={`Created on ${new Date(photo.date_time).toDateString()}`}/>
              <CardMedia component="img" image={`/images/${photo.file_name}`} title={`${this.state.userInfo.first_name} ${this.state.userInfo.last_name}`}/>
              <CardContent>
                <Typography variant="caption">
                  {photo.comments && photo.comments.map((comment) => (
                    <Grid container key={comment._id}>
                      <Grid item xs={2}>
                        {new Date(comment.date_time).toDateString()}
                      </Grid>
                      <Grid item xs={2}>
                        <Link to={`/users/${comment.user._id}`}>
                         {`${comment.user.first_name} ${comment.user.last_name}`}
                        </Link>
                      </Grid>
                      <Grid item xs={8}>
                        {comment.comment}
                      </Grid>
                    </Grid>
                  ))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
}

export default UserPhotos;
