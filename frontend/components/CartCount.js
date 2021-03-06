import React from 'react'
import PropTypes from 'prop-types'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import styled from 'styled-components'

const AnimationStyles = styled.span`
  position: relative;
  .count {
    display: block;
    position: relative;
    transition: all 0.5s;
    backface-visibility: hidden;
  }
  .count-enter {
    transform: rotateX(0.5turn);
    &-active {
      transform: rotateX(0);
    }
  }
  .count-exit {
    position: absolute;
    top: 0;
    transform: rotateX(0);
    &-active {
      transform: rotateX(-0.5turn);
    }
  }
`

const Dot = styled.div`
  background: ${props => props.theme.red};
  color: white;
  border-radius: 50%;
  padding: 0.5rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
`

const CartCount = ({ count }) => (
  <AnimationStyles>
    <TransitionGroup>
      <CSSTransition
        unmountOnExit
        className="count"
        classNames="count"
        key={count}
        timeout={{ enter: 500, exit: 500 }}
      >
        <Dot>{count}</Dot>
      </CSSTransition>
    </TransitionGroup>
  </AnimationStyles>
)

CartCount.propTypes = {
  count: PropTypes.number.isRequired,
}

export default CartCount
