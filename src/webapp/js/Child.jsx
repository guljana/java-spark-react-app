/**
 * Created by vivek on 4/6/17.
 */

import React, { Component } from 'react';

class Child extends Component{
    render(){
        return (
            <div>
                and this is the <b>{this.props.name}</b>.
            </div>
        );
    }
}
export default Child;

Child.propTypes = {
    name: React.PropTypes.string.isRequired
};
