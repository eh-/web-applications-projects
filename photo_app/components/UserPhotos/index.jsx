import React from "react";
import { 
  Typography, 
  Grid, 
  Card, 
  CardHeader, 
  CardMedia, 
  CardContent, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { MentionsInput, Mention } from 'react-mentions';
import { Link } from "react-router-dom";

import "./styles.css";
import axios from 'axios';

/**
 * Define UserPhotos, a React component of CS142 Project 5.
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      photosOfUser: null,
      userInfo: null,
      photo_id_dialog: null,
      new_comment_text: "",
      new_comment_error: "",
      user_list: [],
      remove_comment_id_dialog: null,
      remove_comment_id_error: "",
      remove_photo_id_dialog: null,
      remove_photo_id_error: "",
    };

    this.fetchUserPhotosInfo = this.fetchUserPhotosInfo.bind(this);
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClickCancel = this.handleClickCancel.bind(this);
    this.handleClickSave = this.handleClickSave.bind(this);
    this.updateNewCommentText = this.updateNewCommentText.bind(this);
    this.handleOpenRemovePhotoDialog = this.handleOpenRemovePhotoDialog.bind(this);
    this.handleCancelRemovePhotoDialog = this.handleCancelRemovePhotoDialog.bind(this);
    this.handleConfirmRemovePhotoDialog = this.handleConfirmRemovePhotoDialog.bind(this);
    this.handleOpenRemoveCommentDialog = this.handleOpenRemoveCommentDialog.bind(this);
    this.handleCancelRemoveCommentDialog = this.handleCancelRemoveCommentDialog.bind(this);
    this.handleConfirmRemoveCommentDialog = this.handleConfirmRemoveCommentDialog.bind(this);

    this.mention_regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    
    this.fetchUserPhotosInfo();
  }

  componentDidUpdate(prevProps){
    if(prevProps.match.params.userId !== this.props.match.params.userId || prevProps.uploaded_new_photo !== this.props.uploaded_new_photo){
      this.fetchUserPhotosInfo();
    }
  }

  fetchUserPhotosInfo(){
    axios.get(`/photosOfUser/${this.props.match.params.userId}`).then(photos => {
      axios.get(`/user/${this.props.match.params.userId}`).then(user => {
        axios.get(`/user/list`).then(users => {
          const mentions_list = users.data.map((u) => {
            return {
              id: u._id,
              display: `${u.first_name} ${u.last_name}`
            };
          });
          this.setState({photosOfUser: photos.data, userInfo: user.data, user_list: mentions_list}, () => {
            if(this.state.userInfo){
              this.props.changeSecondaryTitle(`Photos Of ${this.state.userInfo.first_name} ${this.state.userInfo.last_name}`);
            }
          });
        }).catch(err => {
          console.log(`${err.response.status}: ${err.response.data}`);
          this.setState({photosOfUser: null, userInfo: null, user_list: []});
        });
      }).catch(err => {
        console.log(`${err.response.status}: ${err.response.data}`);
        this.setState({photosOfUser: null, userInfo: null, user_list: []});
      });
    }).catch(err => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.setState({photosOfUser: null, userInfo: null, user_list: []});
    });
  }

  handleClickOpen(photo_id){
    this.setState({photo_id_dialog: photo_id, new_comment_text: "", new_comment_error: ""});
  }

  handleClickCancel(){
    this.setState({photo_id_dialog: null, new_comment_text: "", new_comment_error: ""});
  }

  handleClickSave(){
    if(this.state.new_comment_text === ""){
      this.setState({new_comment_error: "Comment is empty"});
      return;
    }
    axios.post(`/commentsOfPhoto/${this.state.photo_id_dialog}`, {
      comment: this.state.new_comment_text,
    }).then(() => {
      this.setState({photo_id_dialog: null, new_comment_text: "", new_comment_error: ""}, this.fetchUserPhotosInfo);
    }).catch(err => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.setState({new_comment_error: err.response.data});
    });
  }

  updateNewCommentText(event){
    this.setState({new_comment_text: event.target.value});
  }

  handleOpenRemovePhotoDialog(photo_id){
    this.setState({remove_photo_id_dialog: photo_id});
  }

  handleCancelRemovePhotoDialog(){
    this.setState({remove_photo_id_dialog: null});
  }

  handleConfirmRemovePhotoDialog(){
    axios.post(`/removePhoto`, {photo_id: this.state.remove_photo_id_dialog}).then(() => {
      this.setState({remove_photo_id_dialog: null, remove_photo_id_error: ""}, this.fetchUserPhotosInfo);
    }).catch(err => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.setState({remove_photo_id_error: err.response.data});
    });
  }

  handleOpenRemoveCommentDialog(comment_id){
    this.setState({remove_comment_id_dialog: comment_id});
  }

  handleCancelRemoveCommentDialog(){
    this.setState({remove_comment_id_dialog: null});
  }

  handleConfirmRemoveCommentDialog(){
    axios.post(`/removeComment`, {comment_id: this.state.remove_comment_id_dialog}).then(() => {
      this.setState({remove_comment_id_dialog: null, remove_comment_id_error: ""}, this.fetchUserPhotosInfo);
    }).catch(err => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.setState({remove_comment_id_error: err.response.data});
    });
  }

  render() {
    if(this.state.userInfo === null) return "";
    return (
      <Grid container justify="space-evenly" alignItems="flex-start">
        {this.state.photosOfUser && this.state.photosOfUser.map((photo) => (
          <Grid item xs={12} key={photo._id}>
            <Card>
              <CardHeader 
                title={`Created on ${new Date(photo.date_time).toDateString()}`}
                action={this.props.loggedInUser._id === photo.user_id && (
                  <Button variant="outlined" onClick={() => this.handleOpenRemovePhotoDialog(photo._id)}>
                    Remove
                  </Button>
                )}
              />
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
                      <Grid item xs={this.props.loggedInUser._id === comment.user._id ? 7 : 8}>
                        {comment.comment.replace(this.mention_regex, '@$1')}
                      </Grid>
                      <Grid item xs={this.props.loggedInUser._id === comment.user._id ? 1 : 0}>
                        {this.props.loggedInUser._id === comment.user._id && (
                          <Button variant="outlined" onClick={() => this.handleOpenRemoveCommentDialog(comment._id)}>
                            Remove
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  ))}
                </Typography>
                <Button variant="outlined" onClick={() => this.handleClickOpen(photo._id)}>
                  Add Comment
                </Button>
              </CardContent>
            </Card>
            <Dialog fullWidth maxWidth="sm" open={this.state.photo_id_dialog !== null} onClose={this.handleClickCancel}>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogContent>
                {this.state.new_comment_error && (
                  <Alert severity="error">
                    {this.state.new_comment_error}
                  </Alert>
                )}
                <MentionsInput
                  value={this.state.new_comment_text}
                  onChange={event => this.updateNewCommentText(event)}
                  placeholder={"Add comment"}
                  style={{
                    height: 70,
                  }}
                >
                  <Mention
                    trigger="@"
                    data={this.state.user_list}
                    displayTransform={(id, display) => `@${display}`}
                    appendSpaceOnAdd
                  />
                </MentionsInput>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleClickCancel}>Cancel</Button>
                <Button onClick={this.handleClickSave}>Add Comment</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={this.state.remove_photo_id_dialog !== null} onClose={this.handleCancelRemovePhotoDialog}>
              <DialogTitle>Remove Photo</DialogTitle>
              <DialogContent>
                {this.state.remove_photo_id_error && (
                  <Alert severity="error">
                    {this.state.remove_photo_id_error}
                  </Alert>
                )}
                <Alert severity="warning" sx={{mt:1}}>
                  Removing a photo is permanent. Do you want to continue?
                </Alert>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleCancelRemovePhotoDialog}>Cancel</Button>
                <Button onClick={this.handleConfirmRemovePhotoDialog}>Confirm</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={this.state.remove_comment_id_dialog !== null} onClose={this.handleCancelRemoveCommentDialog}>
              <DialogTitle>Remove Comment</DialogTitle>
              <DialogContent>
                {this.state.remove_comment_id_error && (
                  <Alert severity="error">
                    {this.state.remove_comment_id_error}
                  </Alert>
                )}
                <Alert severity="warning" sx={{mt:1}}>
                  Removing a comment is permanent. Do you want to continue?
                </Alert>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleCancelRemoveCommentDialog}>Cancel</Button>
                <Button onClick={this.handleConfirmRemoveCommentDialog}>Confirm</Button>
              </DialogActions>
            </Dialog>
          </Grid>
        ))}
      </Grid>
    );
  }
}

export default UserPhotos;
