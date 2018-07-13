import React, { Component } from 'react'
import logic from '../../logic'
import img from '../../styles/images/surfgroup.jpg'
import './style.css'
import { Button, Form, FormGroup, Input, Col, Container } from 'reactstrap';
import swal from 'sweetalert2'


class Register extends Component {
    state = { name: '', surname: '', email: '', password: '' }

    componentDidMount() {
        if (sessionStorage.getItem('userId')) {
            logic.listGroups()
                .catch(() => {
                    swal({
                        type: 'error',
                        title: 'Hey!',
                        html: '<p>You are already registered!</p>',
                        animation: true,
                        customClass: 'animated flipInX'
                    })
                })
                .then(this.props.history.push(`/login`))
        }
    }

    updateName = e => {
        this.setState({ name: e.target.value })
    }

    updateSurname = e => {
        this.setState({ surname: e.target.value })
    }

    updateEmail = e => {
        this.setState({ email: e.target.value })
    }

    updatePassword = e => {
        this.setState({ password: e.target.value })
    }

    register = e => {
        e.preventDefault()

        const { name, surname, email, password } = this.state

        logic.registerUser(name, surname, email, password)
            .then(() => this.props.onRegister())
            .then(() => swal({
                type: 'success',
                title: 'Congrats!',
                html: '<p>Registered Successful!</p>',
                animation: true,
                customClass: 'animated flipInX'
            }))
            .catch(({ message }) => {
                swal({
                    type: 'error',
                    title: 'Oops... ',
                    html: '<p>Something went wrong!</p>',
                    animation: true,
                    customClass: 'animated flipInX'
                })
                this.props.onRegisterError(message)
            })

        this.setState({ name: '', surname: '', email: '', password: '' })
    }

    render() {
        return <main id="" >
            <div className="container-form-user">
            <img id='background-group' src={img} alt='background' />            
            <Container >
                <Col sm={{ size: 10, offset: 1 }} md={{ size: 6, offset: 3 }} >
                    <Form onSubmit={this.register} className='mb-5 form-user'>
                        <h3 className='text-center'>Register</h3>
                        <hr/>
                        <FormGroup>
                            <Input type="name" onChange={this.updateName} placeholder="name" />
                        </FormGroup>
                        <FormGroup>
                            <Input type="surname" onChange={this.updateSurname} placeholder="surname" />
                        </FormGroup>
                        <FormGroup>
                            <Input type="email" onChange={this.updateEmail} placeholder="email" />
                        </FormGroup>
                        <FormGroup>
                            <Input type="password" onChange={this.updatePassword} placeholder="password" />
                        </FormGroup>
                        <Button className='std-button'>Go on Register! </Button>
                    </Form>
                </Col>
            </Container>
            </div>
        </main>
    }
}

export default Register