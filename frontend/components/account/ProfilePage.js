// Import frameworks
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

// Import material-ui
import {AppBar,
        Button,
        Card,
        CardActions,
        CardContent,
        CardHeader,
        Collapse,
        Divider,
        Icon,
        IconButton,
        InputAdornment,
        List,
        ListItem,
        ListItemSecondaryAction,
        ListItemText,
        ListSubheader,
        Tab,
        Tabs,
        Typography,
        TextField } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import BookIcon from '@material-ui/icons/Book';
import AddIcon from '@material-ui/icons/Add';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// Define color palette
const theme = createMuiTheme({
  palette: {
    palette: 'dark',
    primary: {
      main: '#A3BAC3',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#67C4D6',
    },
  },
});

/**
 * Component to render the form for editing
 */
class ProfilePage extends Component {
  // Constructor method
  constructor(props) {
    super(props);
    this.state = {
      books: [],
      firstName: '',
      lastName: '',
      email: '',
      error: ''
    };
    var self = this;
    axios.get('/api/account/getUserInfo')
      .then(function (response) {
        var user = response.data.user;
        self.setState({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          books: user.books,
          error: ''
        });
      })
      .catch(function (error) {
        self.setState({
          error: error
        });
      });

  }

  componentDidMount() {
    // Update state to include past user information

  }

  /**
   * Renders actual Update component
   */
  render() {
    return (
      <div
        className="container centerContent"
        style={{
          padding: "0%",
          display: "flex",
          flexDirection: "column",
          minHeight: "95vh"
        }}
      >
      <MuiThemeProvider theme={theme}>
      <AppBar position="static" color="primary">
        <Tabs
          value={this.state.value}
          onChange={this.handleChange}
          indicatorColor="primary"
          fullWidth
        >
          <Tab label="BOOKS" />
          <Tab label="PROFILE" />
          <Tab label="FRIENDS" />
        </Tabs>
      </AppBar>
      <Card style={{ width:"30%", height:"80%", margin: "10%"}}>
      <CardHeader
        title={ this.state.firstName }
        subheader={ this.state.email }
      >
      <BookIcon />
      </CardHeader>
      <CardContent>
        <Typography component="p">
        hello bitch
        </Typography>
      </CardContent>
      <CardActions disableActionSpacing>
        <IconButton aria-label="Add to favorites">
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </Card>


      <Button
        className="container centerContent"
        variant="fab"
        color="primary"
        style={{ position: 'absolute', bottom: "10%", right: "10%" }}>
        <AddIcon/>
      </Button>
      </MuiThemeProvider>
</div>
    );
  }
}

// Prop validations
ProfilePage.propTypes = {

};

const mapStateToProps = ({ authState }) => {
  return {
  };
};

export default connect(mapStateToProps)(ProfilePage);
