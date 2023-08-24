import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

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
