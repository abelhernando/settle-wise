import React from 'react';
import { withRouter } from 'react-router-dom'
import pic01 from '../../styles/images/pic01.jpg'


function One(props) {

    return (
        <div className="one">
            <section className="wrapper">
                <div className="inner flex flex-3">
                    <div className="flex-item left">
                        <div>
                            <h3>Free your wallet of receipts</h3>
                            <p>All expenses are backed up and synced across the group so each member can see them.</p>
                        </div>
                        <div>
                            <h3>Good accounting makes good friends</h3>
                            <p>No more disputes over the bill. Settle Up shows who pays next and minimizes the transactions.</p>
                        </div>
                    </div>
                    <div className="flex-item image fit round">
                        <img src={pic01} alt="" />
                    </div>
                    <div className="flex-item right">
                        <div>
                            <h3>Take SettleWise anywhere</h3>
                            <p>You do not have to keep the receipt. With mobile applications for iPhone and Android, you can add new expenses as soon as they occur.</p>
                        </div>
                        <div>
                            <h3>We are experts in the field of what is fair</h3>
                            <p>How should we divide the cost of rent? At what point is a girlfriend really a roommate? Participate in research on what is fair and receive advice on all kinds of problems when sharing.</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default withRouter(One)