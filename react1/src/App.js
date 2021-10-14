import Header from './components/Header'
import TaskList from './components/TaskList'
import AddTask from './components/AddTask'
import {useState} from 'react'

const App = () => {
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskList, setTaskList] = useState([
    {
      id: '11',
      text: 'Moms day',
      day: 'Oct 14th at 1:00 pm',
      reminder: true,
    },
    {
      id: '12',
      text: 'University stuff',
      day: 'Oct 15th at 4:00 pm',
      reminder: false,
    },
    {
      id: '13',
      text: 'Look for flats in Poland',
      day: 'Oct 16th at 2:00 pm',
      reminder: true,
    },
  ])

  const onDelete = id => {
    setTaskList(taskList.filter(task => task.id !== id))
  }

  const toggleReminder = id => {
    setTaskList(taskList.map(task => {
      if (task.id === id) {
        task.reminder = !task.reminder
      }
      return task
    }))
  }

  const addTask = task => {
    const id = String(+Date.now() + Math.floor(Math.random() * 10))
    setTaskList([...taskList, {...task, id}])
  }

  return (
    <div className="container">
      <Header
        onAddClick={() => setShowAddTask(!showAddTask)}
        isFormShown={showAddTask}
      />
      {showAddTask ? <AddTask addTask={addTask} /> : ''}
      <TaskList taskList={taskList}
                onDelete={onDelete}
                onToggle={toggleReminder}
      />
    </div>
  )
}

export default App
