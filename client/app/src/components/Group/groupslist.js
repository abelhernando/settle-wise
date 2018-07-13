import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { CardBody, CardTitle, Card } from 'reactstrap';
import './list-style.css'

class GroupsList extends Component {
    changeColor = (i) => {
        const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'danger',]

        if (i > 5 || typeof i === undefined) i = 0;

        return colors[i].toString()
    }
    render() {
        return this.props.groups.map((group, key) => <div key={key} className='link'>
            <Card color={this.changeColor(key)} className='group-card'>
                <CardBody>
                    <Link to={`/groups/${group._id}`}>
                        <CardTitle>{group.name}</CardTitle>
                    </Link>
                </CardBody>
            </Card>
        </div>
        )
    }

}
export default GroupsList;