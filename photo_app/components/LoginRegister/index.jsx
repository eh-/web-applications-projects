import React from "react";
import { Alert, Button, Container, Box, TextField } from "@mui/material";
import axios from 'axios';

class LoginRegister extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      fail_login_register_message: "",
      open_login_form: true,
      login_name: "",
      password1: "",
      password2: "",
      first_name: "",
      last_name: "",
      location: "",
      occupation: "",
      description: "",
      successRegister: false,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.changeForms = this.changeForms.bind(this);

    this.props.changeSecondaryTitle("");
  }

  changeForms(value){
    this.setState({
      open_login_form: value, 
      login_name: "",
      password1: "",
      password2: "",
      first_name: "",
      last_name: "",
      location: "",
      occupation: "",
      description: "",
      fail_login_register_message: "",
      successRegister: false,
    });
  }

  updateForm(event){
    this.setState({[event.target.name]: event.target.value});
  }

  handleLogin(event){
    event.preventDefault();
    if(this.state.login_name === "" || this.state.password1 === ""){
      this.setState({fail_login_register_message: "Missing required fields"});
      return;
    }
    axios.post("/admin/login", {
      login_name: this.state.login_name,
      password: this.state.password1,
    }).then(response => {
      this.props.setLoggedInUser(response.data);
      this.props.history.push(`/users/${response.data._id}`);
    }).catch(err => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.props.setLoggedInUser(null);
      this.setState({fail_login_register_message: err.response.data});
    });
  }
  
  handleRegister(event){
    event.preventDefault();
    if(this.state.login_name === "" || 
      this.state.password1 === "" || 
      this.state.password2 === "" || 
      this.state.first_name === "" || 
      this.state.last_name === "" 
    ){
      this.setState({fail_login_register_message: "Missing required fields"});
      return;
    }
    if(this.state.password1 !== this.state.password2){
      this.setState({fail_login_register_message: "Password doesn't match"});
      return;
    }

    axios.post("/user", {
      login_name: this.state.login_name,
      password: this.state.password1,
      password2: this.state.password2,
      first_name: this.state.first_name,
      last_name: this.state.last_name, 
      location: this.state.location,
      description: this.state.description,
      occupation: this.state.occupation,
    }).then(() => {
      this.setState({
        successRegister: true,
        login_name: "",
        password1: "",
        password2: "",
        first_name: "",
        last_name: "",
        location: "",
        occupation: "",
        description: "",
        fail_login_register_message: "",
      });
    }).catch(err => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.setState({fail_login_register_message: err.response.data});
    });
  }

  render(){
    const loginForm = (
      <Box 
        component="form" 
        noValidate
        sx={{mt: 1}}
      >
        <TextField 
          margin="normal" 
          required 
          fullWidth 
          label="Login Name"
          name="login_name"
          autoFocus
          size="small"
          value={this.state.login_name}
          onChange={event => this.updateForm(event)}
        />
        <TextField 
          margin="normal"
          required
          fullWidth
          label="Password"
          name="password1"
          type="password"
          size="small"
          value={this.state.password1}
          onChange={event => this.updateForm(event)}
        />
        <Button
          type="submit"
          variant="contained"
          id="loginButton"
          fullWidth
          sx={{ mt: 1 }}
          onClick={event => this.handleLogin(event)}
        >
          Login
        </Button>
      </Box>
    );
    const registerForm = (
      <Box 
        component="form" 
        noValidate 
        sx={{mt: 1}}
      >
        <TextField 
          margin="normal" 
          required 
          fullWidth 
          label="Login Name"
          name="login_name"
          autoFocus
          size="small"
          value={this.state.login_name}
          onChange={event => this.updateForm(event)}
        />
        <TextField 
          margin="normal"
          required
          fullWidth
          label="Password"
          name="password1"
          type="password"
          size="small"
          value={this.state.password1}
          onChange={event => this.updateForm(event)}
        />
        <TextField 
          margin="normal"
          required
          fullWidth
          id="password2"
          label="Retype Password"
          name="password2"
          type="password"
          size="small"
          value={this.state.password2}
          onChange={event => this.updateForm(event)}
        />
        <TextField 
          margin="normal" 
          required
          fullWidth
          label="First Name"
          name="first_name"
          size="small"
          value={this.state.first_name}
          onChange={event => this.updateForm(event)}
        />
        <TextField 
          margin="normal" 
          required
          fullWidth
          label="Last Name"
          name="last_name"
          size="small"
          value={this.state.last_name}
          onChange={event => this.updateForm(event)}
        />
        <TextField 
          margin="normal" 
          fullWidth
          label="Location"
          name="location"
          size="small"
          value={this.state.location}
          onChange={event => this.updateForm(event)}
        />
        <TextField 
          margin="normal" 
          fullWidth
          label="Occupation"
          name="occupation"
          size="small"
          value={this.state.occupation}
          onChange={event => this.updateForm(event)}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Description"
          name="description"
          size="small"
          multiline
          maxRows={4}
          value={this.state.description}
          onChange={event => this.updateForm(event)}
        />

        <Button
          type="submit"
          variant="contained"
          id="registerButton"
          fullWidth
          sx={{ mt: 1 }}
          onClick={event => this.handleRegister(event)}
        >
          Register
        </Button> 
      </Box>
    );

    return (
    <Container component="main">
      <Button
        variant={this.state.open_login_form ? "contained" : "outlined"}
        sx={{ my: 2, mx: 1 }}
        onClick={() => this.changeForms(true)}
      >
        Login
      </Button>
      <Button
        variant={this.state.open_login_form ? "outlined" : "contained"}
        sx={{my: 2, mx: 1 }}
        onClick={() => this.changeForms(false)}
      >
        Register
      </Button>
      <Box
        sx={{
        marginTop: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        }}
      >
        
        {this.state.fail_login_register_message && (
          <Alert severity="error">
            {this.state.fail_login_register_message}
          </Alert>
        )}
        {this.state.successRegister && (
          <Alert severity="success">
            Registered Successfully
          </Alert>
        )}
        {this.state.open_login_form ? loginForm : registerForm}
      </Box>
    </Container>
    );
  }
}

export default LoginRegister;