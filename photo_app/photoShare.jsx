import React from "react";
import ReactDOM from "react-dom";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import axios from 'axios';

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secondaryTitle: "",
      version: "",
      loggedInUser: null,
      uploaded_new_photo: false,
    };

    const first_link = window.location.href;
    
    this.changeSecondaryTitle = this.changeSecondaryTitle.bind(this);
    this.setLoggedInUser = this.setLoggedInUser.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.uploadedPhoto = this.uploadedPhoto.bind(this);

    axios.get("/test/info").then(response => {
      if(response.data.loggedInUser){
        this.setState({loggedInUser: response.data.loggedInUser, version: response.data.version},() => {
          window.location.replace(first_link);
        });
      }
      else{
        this.setState({version: response.data.version, loggedInUser: null});
      }
    }).catch(error => {
      console.log(error.message);
      this.setState({version: ""});
    });
  }

  changeSecondaryTitle(newSecondaryTitle){
    this.setState({secondaryTitle: newSecondaryTitle});
  }

  setLoggedInUser(loggedInUser){
    this.setState({loggedInUser: loggedInUser});
  }

  handleLogout(event){
    if(event){
      event.preventDefault();
    }
    axios.post("/admin/logout").then(() => {
      this.setLoggedInUser(null);
    }).catch(err => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.setLoggedInUser(null);
    });
  }

  uploadedPhoto(){
    this.setState(prevState => ({uploaded_new_photo: !prevState.uploaded_new_photo}));
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar 
                secondaryTitle={this.state.secondaryTitle} 
                version={this.state.version} 
                loggedInUser={this.state.loggedInUser}
                handleLogout={this.handleLogout}
                uploadedPhoto={this.uploadedPhoto}
              />
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                <UserList loggedInUser={this.state.loggedInUser}/>
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="cs142-main-grid-item">
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={() => (
                      <Typography variant="body1">
                        Welcome to your photosharing app! This{" "}
                        <a href="https://mui.com/components/paper/">Paper</a>{" "}
                        component displays the main content of the application.
                        The {"sm={9}"} prop in the{" "}
                        <a href="https://mui.com/components/grid/">Grid</a> item
                        component makes it responsively display 9/12 of the
                        window. The Switch component enables us to conditionally
                        render different components to this part of the screen.
                        You don&apos;t need to display anything here on the
                        homepage, so you should delete this Route component once
                        you get started.
                      </Typography>
                    )}
                  />
                  {this.state.loggedInUser ? (
                    <Route
                      path="/users/:userId"
                      render={(props) => (
                        <UserDetail 
                          {...props} 
                          changeSecondaryTitle={this.changeSecondaryTitle} 
                          loggedInUser={this.state.loggedInUser}
                          handleLogout={this.handleLogout}
                          uploaded_new_photo={this.state.uploaded_new_photo}
                        />
                      )}
                    />
                  ): 
                    <Redirect path="/users/:userId" to="/login-register"/>}
                  {this.state.loggedInUser ? (
                    <Route
                      path="/photos/:userId"
                      render={(props) => (
                        <UserPhotos 
                          {...props} 
                          changeSecondaryTitle={this.changeSecondaryTitle} 
                          uploaded_new_photo={this.state.uploaded_new_photo}
                          loggedInUser={this.state.loggedInUser} 
                        />
                      )}
                    />
                  ):
                    <Redirect path="/photos/:userId" to="/login-register"/>}
                  {this.state.loggedInUser ? (
                    <Route
                      path="/users"
                      render={(props) => (
                        <UserList 
                          {...props} 
                          changeSecondaryTitle={this.changeSecondaryTitle} 
                        />
                      )}
                    />
                  ):
                    <Redirect path="/users" to="/login-register"/>}
                  <Route 
                    path="/login-register"
                    render={(props) => (
                      <LoginRegister 
                        {...props} 
                        changeSecondaryTitle={this.changeSecondaryTitle} 
                        setLoggedInUser={this.setLoggedInUser}
                      />
                    )}
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
