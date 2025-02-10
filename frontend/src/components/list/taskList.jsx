import React, { useEffect, useState, useContext } from 'react'
import Table from '../table';
import { Link } from "react-router-dom";
import useModal from '../../hooks/useModal';
import Modal from '../modal';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import AddTaskIcon from '@mui/icons-material/AddTask';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import { Context } from '../../context/Context';

const TaskList = ({ tasks, courses, studentId, getStudent }) => {
  const [filteredTasks, setFilteredTasks] = useState([]);
  const filteredTasksModal = useModal()
  const coursesWithTasks = courses.filter(course => tasks.some(task => task.courseId === course.id))
  const [matches, setMatches] = useState(
    window.matchMedia("(min-width: 700px)").matches
  );
  const [courseId, setCourseId] = useState(null)
  const { changeTaskStatus, changeAlertStatusAndMessage } = useContext(Context)

  useEffect(() => {
    window
      .matchMedia("(min-width: 700px)")
      .addEventListener('change', e => setMatches(e.matches));
  }, []);
  const getTasksProgress = (crsId) => {
    const progress = getTasksStatus(crsId);
    const stringValue = progress.toString();
    const valuesArray = stringValue.split('/');
    if ((Number(valuesArray[0]) !== 0)) {
      return Number(valuesArray[0]) / Number(valuesArray[1]);
    } else {
      return 0;
    }
  }


  const openTaskModal = async (crsId) => {
    setCourseId(crsId);
    const courseTasks = tasks.filter(tk => tk.courseId === crsId);
    setFilteredTasks(courseTasks);
    filteredTasksModal.open()
  }

  const getTasksStatus = (crsId) => {
    if (tasks.length > 0) {
      const courseTasks = tasks.filter(tk => tk.courseId === crsId);
      const completedTasks = courseTasks.filter(tk => tk.studentCourseTask.completed === true);
      return completedTasks.length + '/' + courseTasks.length;
    } else {
      return '0/0';
    }
  }

  const handleChangeTaskStatus = async (task, taskStatus) => {
    try {
        await changeTaskStatus(task.id, studentId, taskStatus);
        await getStudent();
    } catch (error) {
        changeAlertStatusAndMessage(true, 'error', 'El estado de la tarea no pudo ser editado... Por favor inténtelo nuevamente.')
        console.log(error);
    }
}

  const coursesColumns = [
    {
      name: 'Título',
      cell: row => (
        <Link to={`/home/courses?id=${row.id}`} className="flex flex-col justify-center">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="group cursor-pointer relative inline-block">{row.title}
              <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                {row.title}
                <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
              </div>
            </div>
          </div>
        </Link>),
      sortable: true,
      searchable: true,
      selector: row => row.title,
    },
    {
      name: 'Descripción',
      cell: row => {
        return (<><div className="flex flex-col justify-center">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="group cursor-pointer relative inline-block">{row.description}
              <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                {row.description}
                <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
              </div>
            </div>
          </div>
        </div></>)
      },
      sortable: true,
    },
    {
      name: 'Fecha de inicio',
      selector: row => {
        var dt = new Date(row.startAt);
        let year = dt.getFullYear();
        let month = (dt.getMonth() + 1).toString().padStart(2, "0");
        let day = dt.getDate().toString().padStart(2, "0");
        var date = day + '/' + month + '/' + year; return date
      },
      sortable: true,
    },
    {
      name: 'Duración',
      selector: row => row.duration,
      sortable: true,
    },
    {
      name: 'Tareas pendientes',
      selector: row => getTasksStatus(row.id),
      cell: row => (
        <div className="flex flex-row justify-center">
          <span className="my-auto mr-2">{getTasksStatus(row.id)}</span>
          <button onClick={() => openTaskModal(row.id)} className="rounded-2xl bg-orange-200 shadow px-2 py-1 my-2">
            <span>{((getTasksProgress(row.id) === 0) && (getTasksStatus(row.id) !== '0/0')) && (<><CloseIcon color="error" /></>)}{(getTasksProgress(row.id) === 1) && (<><DoneAllIcon color="success" /></>)}{((getTasksProgress(row.id) < 1) && ((getTasksProgress(row.id) > 0))) && (<><DoneIcon color="success" /></>)}</span>
          </button>
        </div>),
      sortable: true,
    },
  ];
  const taskColumn = [
    {
      name: 'Título',
      selector: row => row.title,
      sortable: true,
      searchable: true,
    },
    {
      name: 'Estado de la tarea',
      cell: row => {
        return (<>{(row.studentCourseTask.completed === false) ? <><span className="my-auto mr-2">No completada</span><CloseIcon color="error" /></> : <><span className="my-auto mr-2">Completada</span><DoneIcon color="success" /></>}</>)
      },
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: row => (
      <div className="flex flex-nowrap">
          <button className="rounded-full p-1 bg-red-300 hover:bg-red-400 mx-1" onClick={() => handleChangeTaskStatus(row, false)}>
              <RemoveDoneIcon />
          </button>
          <button className="rounded-full p-1 bg-green-300 hover:bg-green-400 mx-1" onClick={() => handleChangeTaskStatus(row, true)}>
              <DoneOutlineIcon />
          </button>
      </div>),
      sortable: true,
  },
  ];

  const modalStyles = matches ? { minWidth: '650px' } : {}

  useEffect(() => {
    console.log('tasks changed');
    const courseTasks = tasks.filter(tk => tk.courseId === courseId);
    setFilteredTasks(courseTasks);
  }, [tasks, courses])
  

  return (<>
    <Modal style={modalStyles} open={filteredTasksModal.isOpen} onClose={filteredTasksModal.toggle} hiddingButton icon={<AddTaskIcon />} closeText="Salir" title="Tareas del curso">
      <div className="mt-8">
        <Table
          columns={taskColumn}
          data={filteredTasks}
          noDataComponent="Este curso no posee tareas"
          pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </div>
    </Modal>
    <Table
      columns={coursesColumns}
      data={coursesWithTasks}
      noDataComponent="Este alumno no esta asociado a ningun curso"
      pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
    />
  </>
  )
}

export default TaskList