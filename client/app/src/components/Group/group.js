import React, { Component } from 'react'
import logic from '../../logic'
import swal from 'sweetalert2'
import img from '../../styles/images/back.jpg'
import { Collapse, Button, CardBody, Card, Input, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter, Col, Alert, Table, Popover } from 'reactstrap';
import './group-style.css'

class Group extends Component {
    state = {
        users: [],
        spends: [],
        email: '',
        groupId: this.props.match.params.groupId,
        amount: 0,
        payerId: '',
        participants: {},
        amounts: {},
        balance: [],
        newUser: '',
        spendName: '',
        collapse1: false,
        collapse2: false,
        collapseSpends: false,
        popoverOpen: false,
        modal: false,
        userPayer: [],
        check: true
    }

    componentDidMount() {
        this.listUsers()
        this.listSpends()
    }

    toggle = (id) => {
        if (id === 1) {
            this.setState({
                collapse1: !this.state.collapse1,
                collapse2: false
            });

        }
        else
            this.setState({ collapse2: !this.state.collapse2, collapse1: false });
    }

    toggleSpends = () => {
        this.setState({
            collapseSpends: !this.state.collapseSpends,
        })

    }

    toggleUser = () => {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        })
    }


    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        })
    }

    addUserToGroup = e => {
        const { groupId, email } = this.state

        logic.addUserToGroup(groupId, email)
            .catch(() => {
                swal({
                    type: 'error',
                    title: 'Hey!',
                    html: '<p>This user is already belongs to the Group!!</p>',
                    animation: true,
                    customClass: 'animated flipInX'
                })
            })
            .then(() => this.listUsers())
            .then(() => this.setState({ email: '' }))
    }

    handlerAddUser = e => {
        this.setState({
            email: e.target.value
        })
    }

    addSpend = e => {
        e.preventDefault()

        let { groupId, payerId, spendName, amount, participants, amounts } = this.state

        const fractions = []

        let calculate = true;

        for (var i in amounts) {
            if (amounts[i] !== 0) calculate = false
        }

        if (calculate) {
            amounts = this.setDefaultAmount()
        }

        var userIds = Object.keys(participants)

        userIds.forEach(userId => {
            fractions.push({ "user": userId, "amount": amounts[userId] })
        })

        logic.addSpend(groupId, amount, spendName, payerId, fractions)
            .then(() => console.log('added a spend to the group'))
            .then(() => this.listSpends())
            .then(() => this.setState({ payerId: '', spendName: '', amount: 0, participants: {}, amounts: {}, collapse2: false }))
            .catch(console.error)
    }

    catchAmount = e => {
        e.preventDefault()
        const amount = parseInt(e.target.value)
        this.setState({ amount })
    }

    catchSpendName = e => {
        e.preventDefault()
        const spendName = e.target.value
        this.setState({ spendName })
    }

    selectPayer = (e) => {
        let payer = e.target.value
        this.setState({ payerId: payer })
    }

    selectParticipant = userId => {
        this.setState(prevState => {
            const { participants } = prevState

            participants[userId] = true

            return { participants }
        })
    }

    unselectParticipant = userId => {
        this.setState(prevState => {
            const { participants } = prevState

            participants[userId] = false

            return { participants }
        })
    }

    setDefaultAmount = () => {
        var userIds = Object.keys(this.state.participants)

        let res = (this.state.amount / userIds.length)

        const amounts = {}

        userIds.forEach(userId => {
            amounts[userId] = parseFloat(res)
        })

        return amounts
    }

    setParticipantAmount = (userId, amount) => {
        this.setState(prevState => {
            const { amounts } = prevState

            amounts[userId] = parseFloat(amount)

            return { amounts }
        })
    }

    listUsers = () => {
        const group = this.state.groupId

        logic.listUsers(group)
            .then(res => {
                this.setState({ users: res.users })
            })
    }

    listSpends() {
        const group = this.state.groupId.toString()

        logic.listSpends(group)
            .then(spends => {
                console.log(spends)

                this.setState({
                    spends
                })
            })
    }

    goBack = e => {
        e.preventDefault()
        this.props.history.push('/home')
    }

    splitSpends = () => {
        const group = this.state.groupId

        logic.splitSpends(group)
            .then(balance => {
                this.setState({ balance, modal: !this.state.modal })
            })
    }

    changeColor = (i) => {
        const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'danger',]

        if (i > 5 || typeof i === undefined) i = 0;

        return colors[i].toString()
    }

    render() {
        return <main id="banner">
            <img id='background-group' src={img} alt='background' />
            <div>
                <Card className='groups-card'>
                    <CardBody className=''>
                        <Label className=''>
                            {this.state.users.length ? <h2>User Members</h2> : null}
                            {this.state.users.map((user, i) => <div>
                                <Alert id={'Popover-' + i} onClick={this.toggleUser} className='users' key={'Popover-' + i} color={this.changeColor(i)}><option>{user.name} {user.surname}</option></Alert>
                            </div>
                            )}
                        </Label>
                        <section id="main" className="">
                            <div className="">
                                <div>
                                    {(this.state.collapse1 === true) ? null : <Button className='form-button' onClick={() => { this.toggle(1) }} style={{ marginBottom: '1rem' }}>Add a User</Button>}
                                    {(this.state.collapse2 === true) ? null : <Button className='form-button' onClick={() => { this.toggle(2) }} style={{ marginBottom: '1rem' }}>Add a Spend</Button>}
                                    <Collapse isOpen={this.state.collapse1}>
                                        <h4>Add a user to Group</h4>
                                        <Card className='' id='form-id'>
                                            <CardBody className='mb-5'>
                                                <Form onSubmit={this.addUserToGroup} >
                                                    <FormGroup>
                                                        <Input className="inner flex flex-3 input-form" type="text" onChange={this.handlerAddUser} placeholder="user email" value={this.state.email} />
                                                    </FormGroup>
                                                    <Button className='form-button'>Add User </Button>
                                                </Form>
                                                <Button className='spc-button' onClick={() => { this.toggle(1) }}>Cancel</Button>
                                            </CardBody>
                                        </Card>
                                    </Collapse>
                                    <Collapse isOpen={this.state.collapse2}>
                                        <h4>Add a spend to the Group</h4>
                                        <Card className='' id='form-id'>
                                            <CardBody className='' >
                                                <Form onSubmit={this.addSpend}>
                                                    <FormGroup>
                                                        <Input className="input-form" type="text" onChange={this.catchSpendName} placeholder="new payment name" value={this.state.spendName} />
                                                        <Input className="input-form" type="number" onChange={this.catchAmount} placeholder="new payment total amount" value={this.state.amount} />
                                                        <Input type="select" className="input-form" name="payer" onChange={e => { this.selectPayer(e) }} >
                                                            <option >Select the user payer:</option>
                                                            {this.state.users.map((user, key) => <option key={key} value={user._id}>{user.name}</option>)}
                                                        </Input>
                                                        {this.state.users.map((user, key) => <div key={key} className='form-check'>
                                                            <FormGroup check className='spend-form'>
                                                                <Label check>
                                                                    <h5 className=''>{user.name}</h5>
                                                                    <Input className="input-form" onClick={e => { e.target.checked ? this.selectParticipant(user._id) : this.unselectParticipant(user._id) }} className='my-checkbox' size='lg' type="checkbox" />
                                                                    <Label>
                                                                        <Input className="input-form" type="number" onChange={e => this.setParticipantAmount(user._id, e.target.value)} placeholder='amount payed by the user' />
                                                                    </Label>
                                                                </Label>
                                                            </FormGroup >
                                                        </div>
                                                        )}
                                                    </FormGroup>
                                                    <Button type="submit" className='form-button'>Confirm Spend </Button>
                                                </Form>
                                                <Button className='spc-button' onClick={() => { this.toggle(2) }}>Cancel</Button>
                                            </CardBody>
                                        </Card>
                                    </Collapse>
                                </div>
                                {/*LIST SPENDS TO A GROUP*/}
                                {this.state.spends.length ? <h2>This are your Group Spends</h2> : null}

                                <Col sm={{ size: 8, offset: 2 }} md={{ size: 6, offset: 3 }} >
                                    {this.state.spends.map((spend, key) => <Table striped className='tableList'>
                                        <thead color="primary" onClick={this.toggleSpends} style={{ marginBottom: '1rem' }}>
                                            <tr >
                                                <th>{spend.name}</th>
                                                <th>{spend.payerName}</th>
                                                <th>{spend.amount.toFixed(2)} €</th>
                                            </tr>
                                        </thead>
                                        <tbody className='collapseList'>{spend.fractions.map((fraction, key) =>
                                            fraction.amount > 0 && <tr>
                                                {/* <Collapse isOpen={this.state.collapseSpends}> */}
                                                <th scope="row"></th>
                                                <td>{fraction.userId.name}</td>
                                                <td>{fraction.amount.toFixed(2)} €</td>
                                                {/* </Collapse> */}
                                            </tr>
                                        )}
                                        </tbody>
                                    </Table>)}
                                </Col>
                            </div>
                        </section>
                        {/*SPLIT SPENDS OF THE GROUP*/}
                        <Button color="danger" className='special-button' onClick={() => {
                            this.splitSpends()
                        }}>Split Spends</Button>
                        <Modal isOpen={this.state.modal} toggle={this.toggleModal} className={this.props.className} >
                            <ModalHeader toggle={this.toggleModal}>Settle Wise</ModalHeader>
                            <ModalBody id=''>
                                {this.state.balance.length ? <h2>Operation Balance</h2> : <h3>There are no Spends to Split</h3>}
                                {this.state.balance.map((res, key) => <div key={key} className=''>
                                    <Table dark>
                                        <thead>
                                            <tr>
                                                <th>Must pay</th>
                                                <th>Will recieve</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row">{res.debtorName}</th>
                                                <td>{res.creditorName}</td>
                                                <td>{res.amount.toFixed(2)} €</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>)}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={this.toggleModal}>Great!</Button>{' '}
                            </ModalFooter>
                        </Modal>
                        <section>
                            <Button color='warning' className='special-button' onClick={this.goBack}>Go to Groups</Button>
                        </section>
                    </CardBody>
                </Card>
            </div>
        </main>
    }
}

export default Group