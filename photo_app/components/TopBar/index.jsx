import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

import "./styles.css";

/**
 * Define TopBar, a React component of CS142 Project 5.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
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
      </AppBar>
    );
  }
}

export default TopBar;
