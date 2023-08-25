import React from "react";
import { AppBar,
  Toolbar, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import axios from "axios";

import "./styles.css";

/**
 * Define TopBar, a React component of CS142 Project 5.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dialog_open: false,
      upload_error: "",
      upload_success: null,
    };

    this.upload_input = null;
    this.handleDialogOpen = this.handleDialogOpen.bind(this);
    this.handleDialogCancel = this.handleDialogCancel.bind(this);
    this.handleClickUpload = this.handleClickUpload.bind(this);
  }

  handleDialogOpen(){
    this.upload_input = null;
    this.setState({dialog_open: true, upload_error: "", upload_success: null});
  }

  handleDialogCancel(){
    this.upload_input = null;
    this.setState({dialog_open: false, upload_error: "", upload_success: null});
  }

  handleClickUpload(){
    if(this.upload_input.files.length === 0){
      this.setState({upload_error: "No file selected"});
      return;
    }
    const domForm = new FormData();
    domForm.append("uploadedphoto", this.upload_input.files[0]);
    axios.post('/photos/new', domForm).then(() => {
      this.props.uploadedPhoto();
      this.setState({upload_error: "", upload_success: true});
    }).catch((err) => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.setState({upload_error: err.response.data});
    });
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
            EH Photo App Version {" "} {this.props.version}
          </Typography> 
          <Typography variant="h5" color="inherit">
            {this.props.loggedInUser ? `Hi ${this.props.loggedInUser.first_name}` : "Please Login"}
          </Typography>
          {this.props.loggedInUser && (
            <Button
              variant="outlined"
              color="inherit"
              sx={{marginX: 2}}
              onClick={this.handleDialogOpen}
            >
              Upload Photo
            </Button>
          )}
          {this.props.loggedInUser && (
            <Button 
              color="inherit" 
              variant="outlined" 
              sx={{marginX: 2}} 
              onClick={event => this.props.handleLogout(event)}
            >
              Log Out
            </Button>
          )}
          {this.props.secondaryTitle && (
            <Typography variant="h5" color="inherit">
              {this.props.secondaryTitle}
            </Typography>
          )}
        </Toolbar>
        <Dialog
          fullWidth
          maxWidth="sm"
          open={this.state.dialog_open}
          onClose={this.handleDialogCancel}
        >
          <DialogTitle>Upload Photo</DialogTitle>
          <DialogContent>
            {this.state.upload_error && (
              <Alert severity="error" sx={{mb: 2}}>
                {this.state.upload_error}
              </Alert>
            )}
            {this.state.upload_success === true && (
              <Alert severity="success" sx={{mb: 2}}>
                Upload Successful
              </Alert>
            )}
            <input type="file" accept="image/*" ref={(domFileRef) => { this.upload_input = domFileRef; }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogCancel}>Cancel</Button>
            <Button onClick={this.handleClickUpload}>Upload Photo</Button>
          </DialogActions>
        </Dialog>
      </AppBar>
    );
  }
}

export default TopBar;
