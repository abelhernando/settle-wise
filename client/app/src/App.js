import React, { Component } from 'react'
import { Link, Route, withRouter, Redirect } from 'react-router-dom'
import logic from './logic'
import Home from './components/Home/home'
import Group from './components/Group/group'
import Landing from './components/Landing/landing'
import One from './components/Landing/one'
import Login from './components/Login/login'
import Register from './components/Register/register'
import Navbar from './components/Header/navbar'

class App extends Component {
  state = { registered: false }

    // componentDidMount() {
    //   if (logic.loggedIn) this.props.history.push('/home')
    // }

  onRegister = () => {
    console.log('register')

    this.setState({ registered: true })
    this.props.history.push('/login')
    
  }

  onRegisterError(message) {
    console.error('register error', message)
  }

  onLogin = () => {
    console.log('login')

    this.props.history.push('/home')
  }

  onLoginError(message) {
    console.error('login error', message)
  }

  onLogout = () => {
    this.setState({
      registered: false
    })
    // this.props.history.push('/')
  }

  render() {
    return (
      <div className="App">
      <Navbar/>
        <Route exact path="/" render={() => (!logic.loggedIn) ? <Landing /> : <Home/>} />
        <Route exact path="/groups/:groupId" render={routeProps => <Group {...routeProps} />} />
        <Route path="/one" render={() => <One />} />
        
          <Route exact path="/register" render={() => {
            return this.state.registered ?
              <Link to="/login"><Login /></Link>
              :
              <Register onRegister={this.onRegister} onRegisterError={this.onRegisterError} />
          }} />
        <Route exact path="/login" render={() =>

          !logic.loggedIn ?
            <Login onLogin={this.onLogin} onLoginError={this.onLoginError} /> : <Redirect to='/home' />} />
        {logic.loggedIn && <Route exact path="/home" render={() => <Home onLogout={this.onLogout} />} />}
      </div>
    );
  }
}

export default withRouter(App);
