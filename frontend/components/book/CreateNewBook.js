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

// Define color palette
const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#FFFFFF',
      contrastText: '#fff'
    },
    secondary: {
      main: '#FFFFFF',
      contrastText: '#00ACC1'
    },
  },
});

/**
 * Component to render the form for a user logging in
 */
class CreateNewBook extends Component {
    // Constructor method
  constructor(props) {
    super(props);
    this.state = {
      reflections: '',
      stars: 0,
      author: '',
      title: '',
      error: '',
    };

    // Bindings so 'this' refers to component
    this.handleCreateBookSubmit = this.handleCreateBookSubmit.bind(this);
    this.handleChangeReflections = this.handleChangeReflections.bind(this);
    this.handleChangeStars = this.handleChangeStars.bind(this);
    this.handleChangeAuthor = this.handleChangeAuthor.bind(this);
    this.handleChangeTitle = this.handleChangeTitle.bind(this);
  }

  // When submit button clicked, will attempt to create a new
  // book to add to user's bookshelf
  handleCreateBookSubmit(event) {
    // Prevent the default form action
    event.preventDefault();

    // Pull variables from state
    const { reflections, stars, author, title } = this.state;
    if (!reflections || !stars || !author || !title ||
        reflections === '' || author === '' || title === '') {
      this.setState({
        error: 'Please fill out all fields',
        pending: false,
      });
      return;
    }

    /**
     * Call to backend route to log the user in
     */
    axios.post('/api/book/create', {
      title,
      author,
      stars,
      reflections
    })
      .then(response => {
        // If the book was not successfully saved
        if (!response.data.success) {
          this.setState({
            error: response.data.error,
            pending: false,
          });
          console.log(response.data.error);
        // If the book was successfully saved
        } else {
          this.setState({
            error: null,
            pending: false,
          });
          console.log("successfully saved book");
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

  handleChangeTitle(event) {
    this.setState({
      title: event.target.value,
    });
  }

  handleChangeAuthor(event) {
    this.setState({
      author: event.target.value,
    });
  }

  handleChangeStars(event) {
    this.setState({
      stars: event.target.value,
    });
  }

  handleChangeReflections(event) {
    this.setState({
      reflections: event.target.value,
    });
  }

  /**
   * Renders actual Login component
   */
  render() {
    // If user is logged in or if user successfully logs in, redirects to home
    return (
      <div
        className="container centerContent"
        style={{
          background: "#000000",
          minHeight: "100vh",
          padding: "15%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <MuiThemeProvider theme={theme}>
          <p> Add a new book </p>
          <TextField
            id="title"
            label="Title"
            margin="normal"
            onChange={ this.handleChangeTitle }
          />

          <br/>

          <TextField
            id="author"
            label="Author"
            margin="normal"
            onChange={ this.handleChangeAuthor }
          />

          <br/>
          <br/>
          <br/>

          <TextField
            id="stars"
            label="Star Rating"
            margin="normal"
            onChange={ this.handleChangeStars }
          />

          <TextField
            id="reflections"
            label="Reflections"
            margin="normal"
            onChange={ this.handleChangeReflections }
          />

          <Button
            color="secondary"
            variant="contained"
            onClick={ this.handleCreateBookSubmit }
            size="large"
            style={{ width: "80%", margin: "0 auto" }}
          >
            Add Book to Bookshelf
          </Button>

          <br/>

          <Link
            style={{ color: '#FFF' }}
            to="/register"
          >
            CREATE AN ACCOUNT
          </Link>

          <br/>
          <br/>
        </MuiThemeProvider>
      </div>
    );
  }
}

CreateNewBook.propTypes = {
  userId: PropTypes.string,
};

const mapStateToProps = ({ authState }) => {
  return {
    userId: authState.userId,
  };
};

export default connect(mapStateToProps)(CreateNewBook);
