import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'

const ADD_TO_CART_MUTATION = gql`
  mutation addToCart($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`

class AddToCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  }

  render() {
    const { id } = this.props
    return (
      <Mutation mutation={ADD_TO_CART_MUTATION} variables={{ id }}>
        {addToCart => <button onClick={addToCart}>Add To Cart</button>}
      </Mutation>
    )
  }
}

export default AddToCart
