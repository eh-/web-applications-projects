import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";
import axios from 'axios';

/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);

    if(this.props.changeSecondaryTitle){
      this.props.changeSecondaryTitle("User List");
    }

    this.state = {
      users:[],
    };

    this.getUserList = this.getUserList.bind(this);
    this.getUserList();
  }

  getUserList(){
    axios.get("/user/list").then(response => {
      this.setState({users: response.data});
    }).catch(err => {
      console.log(`${err.response.status}: ${err.response.data}`);
      this.setState({users: []});
    });
  }

  componentDidUpdate(prevProps){
    if(prevProps.loggedInUser !== this.props.loggedInUser){
      this.getUserList();
    }
  }

  render() {
    return (
      <div>
        <Typography variant="body1">
          Users:
        </Typography>
        <List component="nav">
          {this.state.users.map(user => (
            <Link key={user._id} to={`/users/${user._id}`}>
              <ListItem>
                <ListItemText primary={`${user.first_name} ${user.last_name}`}/>
              </ListItem>
              <Divider />
            </Link>
          ))}
        </List>
      </div>
    );
  }
}

export default UserList;
