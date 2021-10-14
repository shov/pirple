import {useState} from 'react'

const AddTask = ({addTask}) => {
  const [text, setText] = useState('')
  const [day, setDay] = useState('')
  const [reminder, setReminder] = useState(false)

  const onSubmit = e => {
    e.preventDefault()

    if(text?.length < 1) {
      alert('Fill in task at first!')
      return
    }

    addTask({text, day, reminder})
    setText('')
    setDay('')
    setReminder(false)
  }

  return (
    <form className='add-form' onSubmit={onSubmit}>
      <div className='form-control'>
        <label>Add task</label>
        <input
          type='text'
          placeholder='Add task'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className='form-control'>
        <label>Add day & time</label>
        <input
          type='text'
          placeholder='Add day & time'
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
      </div>
      <div className='form-control form-control-check'>
        <label>Set reminder</label>
        <input
          type='checkbox'
          value={reminder}
          checked={reminder}
          onChange={(e) => setReminder(e.currentTarget.checked)}
        />
      </div>
      <input className='btn btn-block' type='submit' value='Save task' />
    </form>
  )
}

export default AddTask
