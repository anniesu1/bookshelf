// Import frameworks
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

// Import material-ui
import { Button, IconButton, InputAdornment, TextField } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import Books from '../book/Books.js';

// Define color palette
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#fcf8ba'
    },
    secondary: {
      main: '#67C4D6',
    },
  },
});

/**
 * Component to render the form for a user logging in
 */
class Login extends Component {
    // Constructor method
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      showPassword: false,
    };

    // Bindings so 'this' refers to component
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
  }

  // When login button clicked, will attempt to login on backend (account.js)
  handleLoginSubmit(event) {
    // Prevent the default form action
    event.preventDefault();

    // Pull variables from state
    const { email, password } = this.state;
    if (!email || !password || email === '' || password === '') {
      this.setState({
        error: 'Email or Password is not filled out',
        pending: false,
      });
      return;
    }

    /**
     * Call to backend route to log the user in
     */
    axios.post('/api/user/login', {
      email,
      password,
    })
      .then(response => {
        // If the user did not successfully log in
        if (!response.data.success) {
          this.setState({
            error: response.data.error,
            pending: false,
          });
        // If the user did successfully log in
        } else {
          this.setState({
            error: null,
            pending: false,
          });
          console.log("successfully logged in");
        }
      })
      // If there was some unhandled error to this point
      .catch(err => {
        this.setState({
          error: err.message,
          pending: false,
        });
      });
  }

  /**
   * Dynamically update state when a user types into the email
   */
  handleChangeEmail(event) {
    this.setState({
      email: event.target.value,
    });
  }

  /**
   * Dynamically update state when a user types into the password
   */
  handleChangePassword(event) {
    this.setState({
      password: event.target.value,
    });
  }

  /**
   * Toggles display of password in text field
   */
  handleClickShowPassword() {
    this.setState({
      showPassword: !this.state.showPassword
    });
  }

  /**
   * Renders actual Login component
   */
  render() {
    // If user is logged in or if user successfully logs in, redirects to home
    if (this.state.error === null) {
      return (
        <Books/>
      )
    }
    else {
      return (
        <div
          className="container centerContent"
          style={{
            minHeight: "100vh",
            padding: "15%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <MuiThemeProvider theme={theme}>
            <p> Welcome to Bookshelf </p>
            <TextField
              id="email"
              label="Email"
              type="email"
              margin="normal"
              onChange={ this.handleChangeEmail }
              style={{ width: "50%", margin: "0 auto" }}
            />

            <br/>

            <TextField
              id="adornment-password"
              label="Password"
              margin="normal"
              type={this.state.showPassword ? 'text' : 'password'}
              value={this.state.password}
              onChange={this.handleChangePassword}
              style={{ width: "50%", margin: "0 auto" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={this.handleClickShowPassword}
                    >
                      {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <br/>
            <br/>
            <br/>

            <Button
              color="secondary"
              onClick={ this.handleLoginSubmit }
              size="large"
              variant="outlined"
              style={{ width: "50%", margin: "0 auto" }}
            >
              LOGIN
            </Button>

            <br/>

            <Button
              size="large"
              variant="outlined"
              color="secondary"
              style={{ width: "50%", margin: "0 auto" }}
            >
              <Link to="/register">
                REGISTER
              </Link>
            </Button>

            <br/>
            <br/>
          </MuiThemeProvider>
        </div>
      );
    }
  }
}

// Prop validations
Login.propTypes = {
  userId: PropTypes.string,
};

const mapStateToProps = ({ authState }) => {
  return {
    userId: authState.userId,
  };
};

export default connect(mapStateToProps)(Login);
