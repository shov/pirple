import Button from './Button'
import {FaTimes} from 'react-icons/fa'
const Header = ({title, onAddClick, isFormShown}) => {
  return (
    <header className='header'>
      <h1>{title}</h1>
      <Button
        onClick={onAddClick}
        color={isFormShown ? 'black' : 'green'}
        text={isFormShown ? <FaTimes style={{color: 'white'}}/> : 'Add'}
      />
    </header>
  )
}

Header.defaultProps = {title: 'Task Tracker'}

export default Header
