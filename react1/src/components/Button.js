const Button = ({text, color, onClick}) => {
  return (
    <button onClick={onClick} className="btn" style={{backgroundColor: color}}>{text}</button>
  )
}

Button.defaultProps = {
  text: 'NO TEXT',
  color: 'black',
}

export default Button
