import React from 'react';
import TestUtils from 'react-addons-test-utils';
import expect from 'expect';
import Child from '../../webapp/js/Child.jsx';

describe('Child', () => {
    it('should work', () => {
        const component = <Child name="test"/>;
        TestUtils.renderIntoDocument(component);
        expect(component).toBeTruthy();
    });
});
