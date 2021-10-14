import Task from './Task'

const TaskList = ({taskList, onDelete, onToggle}) => {

  return (
    <>
      {taskList.map(task => (
        <Task key={task.id}
              task={task}
              onDelete={onDelete}
              onToggle={onToggle}
        />
      ))}
    </>
  )
}

export default TaskList
