import { shallow } from 'enzyme'
import toJSON from 'enzyme-to-json'
import Item from '../components/Item'

const fakeItem = {
  id: 'ABC123',
  title: 'A Cool Item',
  price: 5000,
  description: 'This item is kinda cool!',
  image: 'cat.jpg',
  largeImage: 'longcat.jpg',
}

describe('<Item/>', () => {
  it('renders and matches the snapshot', () => {
    const wrapper = shallow(<Item item={fakeItem} />)
    expect(toJSON(wrapper)).toMatchSnapshot()
  })

  // it('renders the image properly', () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem} />)
  //   const img = wrapper.find('img')
  //   expect(img.props().src).toBe(fakeItem.image)
  //   expect(img.props().alt).toBe(fakeItem.title)
  // })

  // it('renders the price tag and title properly', () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem} />)
  //   const PriceTag = wrapper.find('PriceTag')
  //   expect(PriceTag.children().text()).toBe('R$50')
  //   expect(wrapper.find('Title a').text()).toBe(fakeItem.title)
  // })

  // it('renders out the buttons properly', () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem} />)
  //   const buttonList = wrapper.find('.buttonList')
  //   expect(buttonList.children()).toHaveLength(3)
  //   expect(buttonList.find('Link').exists()).toBe(true)
  //   expect(buttonList.find('AddToCart').exists()).toBe(true)
  //   expect(buttonList.find('DeleteItem').exists()).toBe(true)
  //   console.log(buttonList.debug())
  // })
})
