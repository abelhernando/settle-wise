import React, { Component } from 'react'
import logic from '../../logic'
import api from 'api'
import './style.css'
import swal from 'sweetalert2'
import { Button, Form, FormGroup, Input, Col, Container } from 'reactstrap';
import img from '../../styles/images/surfgroup.jpg'



class Login extends Component {
    state = { email: '', password: '' }

    componentDidMount() {
        if (sessionStorage.getItem('userId')) {
            logic.listGroups()
                .catch(() => {
                    swal({
                        type: 'error',
                        title: 'Hey!',
                        html: '<p>You are already logged!</p>',
                        animation: true,
                        customClass: 'animated flipInX'
                    })
                })
                .then(this.props.history.push(`/home`))
        }
    }

    updateEmail = e => {
        this.setState({ email: e.target.value })
    }

    updatePassword = e => {
        this.setState({ password: e.target.value })
    }

    login = e => {
        e.preventDefault()

        logic.loginUser(this.state.email, this.state.password)
            .then(res => {
                if (res) {
                    sessionStorage.setItem('userId', logic.userId)
                    sessionStorage.setItem('token', api.token)

                    this.props.onLogin()
                }
            })
            .catch(error => {
                swal({
                    type: 'error',
                    title: 'Hey!',
                    html: "<p>Username or password doesn't exist</p>",
                    animation: true,
                    confirmButtonColor: '#00000f',
                    customClass: 'animated flipInX'
                })

            })
    }

    render() {
        return    <div className='container-form-user'>
                <img id='background-group' src={img} alt='background' />

        <Container >
                <Col sm={{ size: 10, offset: 1 }} md={{ size: 6, offset: 3 }} >
                    <Form onSubmit={this.login} className='mb-5 form-user'>
                        <h3 className='text-center'>Login</h3>
                        <hr/>
                        <FormGroup>
                            <Input type="email" onChange={this.updateEmail} placeholder="email" />
                        </FormGroup>
                        <FormGroup>
                            <Input type="password" onChange={this.updatePassword} placeholder="password" />
                        </FormGroup>
                        <Button className='std-button'>Log me in! </Button>
                    </Form>
                </Col>
            </Container>
            </div>


    }
}

export default Login