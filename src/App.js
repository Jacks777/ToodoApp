import { useEffect, useState } from "react";
import "./App.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfDay, endOfDay } from "date-fns";

import NotSuitable from "./NotSuitable";

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [taskText, setTaskText] = useState("");
  const [isImportant, setIsImportant] = useState(false);

  const [toodos, setToodos] = useState([]);

  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [inEditMode, setInEditMode] = useState(false);
  const [editItemKey, setEditItemKey] = useState(null);

  useEffect(() => {
    const handleData = (snapshot) => {
      if (snapshot.exists()) {
        const todosData = Object.values(snapshot.val());
        setToodos(todosData);
      } else {
        console.log("No data found in the 'toodos' table");
      }
    };

    const handleError = (error) => {
      console.error("Error fetching data from the 'toodos' table:", error);
    };

    // Listen for changes in the 'toodos' table
    const unsubscribe = onValue(todosRef, handleData, handleError);

    return () => {
      // Unsubscribe from real-time updates when the component unmounts
      unsubscribe();
    };
  }, []);

  // WRONG SIZE COMPONENT
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Move the conditional rendering outside of the return statement
  if (!isMobile) {
    return <NotSuitable />;
  }

  // FIREBASE CONFIG
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  };

  const { initializeApp } = require("firebase/app");
  const {
    getDatabase,
    ref,
    push,
    set,
    onValue,
    child,
    update,
    remove,
  } = require("firebase/database");

  // END CONFIG FIREBASE
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const todosRef = ref(database, "toodos");

  // PAGES OPEN
  const handleOpenAddTask = () => {
    setActiveButton(!activeButton);
    setAddTaskOpen(!addTaskOpen);

    setTaskText("");
    setSelectedDate(null);
    setIsImportant(false);

    if (inEditMode) {
      setInEditMode(false);
    }
  };

  // COMPILING NEW TOODO

  const handleCompiling = () => {
    const textInput = document.getElementById("textBox");
    const dateInput = document.getElementById("datePicker");

    if (selectedDate === null && taskText === "") {
      textInput.classList.add("danger");
      dateInput.classList.add("danger");
    } else if (selectedDate === null) {
      dateInput.classList.add("danger");
      textInput.classList.remove("danger");
    } else if (taskText === "") {
      dateInput.classList.remove("danger");
      textInput.classList.add("danger");
    } else {
      dateInput.classList.remove("danger");
      textInput.classList.remove("danger");

      const app = initializeApp(firebaseConfig);
      const todosRef = ref(getDatabase(app), "toodos");

      // FORMAT DATE
      const originalDate = selectedDate;

      const day = originalDate.getDate();
      const month = originalDate.toLocaleString("en-US", { month: "long" });
      const year = originalDate.getFullYear();
      const hours = originalDate.getHours();
      const minutes = originalDate.getMinutes();

      const formattedDate = `${day < 10 ? "0" : ""}${day} ${month} ${year} ${
        hours < 10 ? "0" : ""
      }${hours}:${minutes < 10 ? "0" : ""}${minutes}`;

      // END FORMATTING

      const toodoText = taskText;
      const toodoDate = formattedDate;
      const toodoImportant = isImportant;

      const newToodo = {
        toodo: toodoText,
        date: toodoDate,
        done: false,
        important: toodoImportant,
      };

      // Use push without arguments to generate a new key
      const newToodoRef = push(todosRef);

      // Get the auto-generated key
      const newToodoKey = newToodoRef.key;

      // Include the key in the toodo data
      const toodoWithKey = {
        ...newToodo,
        key: newToodoKey,
      };

      // Update the toodo with the key in the database
      set(newToodoRef, toodoWithKey)
        .then(() => {})
        .catch((error) => {
          console.error("Error writing data to the 'toodos' table: ", error);
        });

      handleOpenAddTask();

      setTaskText("");
      setSelectedDate(null);
      setIsImportant(false);
    }
  };

  let deleteTaskInProgress = false;

  // HANDLE CLICKED TASK => DONE!
  const handleDone = (key) => {
    setTimeout(() => {
      if (deleteTaskInProgress) {
        return;
      }

      const toodoToUpdate = toodos.find((task) => task.key === key);

      if (toodoToUpdate && toodoToUpdate.key && toodoToUpdate.toodo !== null) {
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);
        const todosRef = ref(database, "toodos");

        // Update the 'done' property in the database
        const toodoRefToUpdate = child(todosRef, toodoToUpdate.key);
        update(toodoRefToUpdate, { done: !toodoToUpdate.done })
          .then(() => {})
          .catch((error) => {
            console.error("Error updating database: ", error);
          });
      } else {
        console.error(
          "Invalid or missing identifier in the to-do item:",
          toodoToUpdate
        );
      }
    }, 10);
  };

  const handleDeleteTask = (key) => {
    deleteTaskInProgress = true;

    setTimeout(() => {
      const toodoToUpdate = toodos.find((task) => task.key === key);

      if (toodoToUpdate && toodoToUpdate.key) {
        const database = getDatabase(); // Assuming you've already initialized the app elsewhere

        // Reference to the 'toodos' collection
        const todosRef = ref(database, "toodos");

        // Reference to the specific to-do item
        const toodoRefToUpdate = child(todosRef, toodoToUpdate.key);

        // Remove the to-do item from the database
        remove(toodoRefToUpdate)
          .then(() => {
            setToodos((prevToodos) =>
              prevToodos.filter((task) => task.key !== key)
            );
          })
          .catch((error) => {
            console.error("Error deleting data: ", error);
          });
      } else {
        console.error(
          "Invalid or missing identifier in the to-do item:",
          toodoToUpdate
        );
      }
      deleteTaskInProgress = false;
    }, 1000);
  };

  const handleEditTask = (item) => {
    setActiveButton(!activeButton);
    setAddTaskOpen(!addTaskOpen);

    setTaskText(item.toodo);
    setSelectedDate(new Date(item.date));
    setIsImportant(item.important);
    setInEditMode(true);

    setEditItemKey(item.key);
  };

  const handleEditTaskInDB = () => {
    // Formatting the date
    const originalDate = selectedDate;
    const day = originalDate.getDate();
    const month = originalDate.toLocaleString("en-US", { month: "long" });
    const year = originalDate.getFullYear();
    const hours = originalDate.getHours();
    const minutes = originalDate.getMinutes();
    const formattedDate = `${day < 10 ? "0" : ""}${day} ${month} ${year} ${
      hours < 10 ? "0" : ""
    }${hours}:${minutes < 10 ? "0" : ""}${minutes}`;

    // Creating the updated to-do object
    const updatedToodo = {
      toodo: taskText,
      date: formattedDate,
      done: false,
      important: isImportant,
    };

    // Reference to the specific to-do item
    const toodoRefToUpdate = child(todosRef, editItemKey);

    // Update the to-do item in the database
    update(toodoRefToUpdate, updatedToodo)
      .then(() => {})
      .catch((error) => {
        console.error("Error updating to-do item: ", error);
      });

    // Resetting state and handling UI
    setActiveButton(false);
    setAddTaskOpen(false);
    setInEditMode(false);
  };

  return (
    <div className="app">
      <Lander />
      <Tasks
        handleDeleteTask={handleDeleteTask}
        handleDone={handleDone}
        toodos={toodos}
        handleOpenAddTask={handleOpenAddTask}
        activeButton={activeButton}
        addTaskOpen={addTaskOpen}
        handleCompiling={handleCompiling}
        handleEditTask={handleEditTask}
        inEditMode={inEditMode}
        handleEditTaskInDB={handleEditTaskInDB}
      />
      <AddTask
        activeButton={activeButton}
        handleOpenAddTask={handleOpenAddTask}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        taskText={taskText}
        setTaskText={setTaskText}
        isImportant={isImportant}
        setIsImportant={setIsImportant}
      />
    </div>
  );
}

function Lander() {
  useEffect(() => {
    const lander = document.querySelector(".lander");
    const container = document.querySelector(".container_tasks");

    const handleLanderAnimationEnd = () => {
      // Hide the element after the animation is complete
      lander.style.display = "none";
      container.style.display = "flex";
    };

    // Add the animationend event listener
    lander.addEventListener("animationend", handleLanderAnimationEnd);

    // Cleanup function to remove the event listener
    return () => {
      lander.removeEventListener("animationend", handleLanderAnimationEnd);
    };
  }, []);

  return (
    <div className="lander">
      <img src="assets/icons/logo.svg" alt="logo" />
      <h1 className="title_logo">Toodo App</h1>
    </div>
  );
}

function Tasks({
  handleOpenAddTask,
  activeButton,
  addTaskOpen,
  handleCompiling,
  toodos,
  handleDone,
  handleDeleteTask,
  handleEditTask,
  inEditMode,
  handleEditTaskInDB,
}) {
  return (
    <div className="container_tasks">
      <div className="container_tasks-inner">
        <div className="container_tasks-top">
          <h1>Toodo's</h1>
          <img src="/assets/icons/logo.svg" alt="filter" />
        </div>
        <div className="tasks_display">
          {toodos.length < 1
            ? "Geen Toodo's gepland. Voeg er een toe!"
            : toodos
                .slice()
                .sort((a, b) => {
                  if (a.important && !b.important) return -1;
                  if (!a.important && b.important) return 1;

                  return new Date(a.date) - new Date(b.date);
                })
                .map((item) => (
                  <TasksDisplay
                    handleDone={handleDone}
                    key={item.key}
                    item={item}
                    handleDeleteTask={handleDeleteTask}
                    handleOpenAddTask={handleOpenAddTask}
                    handleEditTask={handleEditTask}
                    handleEditTaskInDB={() => handleEditTaskInDB(item)}
                  />
                ))}
        </div>
        <div className="container_tasks-end">
          {inEditMode ? (
            <img
              className={`activeButton`}
              onClick={handleEditTaskInDB}
              src="assets/icons/plus.svg"
              alt="plusEdit"
            />
          ) : (
            <img
              className={`${activeButton ? "activeButton" : ""}`}
              onClick={addTaskOpen ? handleCompiling : handleOpenAddTask}
              src="assets/icons/plus.svg"
              alt="plus"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TasksDisplay({
  item,
  handleDone,
  handleDeleteTask,
  handleOpenAddTask,
  handleEditTask,
}) {
  return (
    <>
      <div
        className={`task ${item.important ? "important" : ""}`}
        onClick={() => handleDone(item.key)}
      >
        <div>
          <h4 className={`${item.done ? "taskActive" : ""}`}>{item.toodo}</h4>
          <div className="task_dateEdit">
            <p>{item.date}</p>
            {item.done && (
              <p className="editFunction" onClick={() => handleEditTask(item)}>
                Edit
              </p>
            )}
          </div>
        </div>
        {item.done && (
          <>
            <img className="check" src="/assets/icons/check.svg" alt="check" />
            <img
              className="trash"
              src="/assets/icons/trash.svg"
              alt="trash"
              onClick={() => handleDeleteTask(item.key)}
            />
          </>
        )}
      </div>
    </>
  );
}

function AddTask({
  activeButton,
  handleOpenAddTask,
  selectedDate,
  setSelectedDate,
  taskText,
  setTaskText,
  isImportant,
  setIsImportant,
}) {
  const currentDate = new Date();
  const minTime = startOfDay(currentDate);
  const maxTime = endOfDay(currentDate);

  return (
    <div className={`container_addTask ${activeButton ? "active" : ""}`}>
      <div className="container_addTask-inner">
        <div className="container_addTask-top">
          <h1>New Toodo</h1>
          <img
            onClick={() => handleOpenAddTask()}
            src="/assets/icons/close.svg"
            alt="close"
          />
        </div>
        <div className="addTask_display">
          <form className="addTask_display-form">
            <input
              id="textBox"
              className="textbox"
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="What needs to be done?"
            />
            <DatePicker
              id="datePicker"
              className="datePicker"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              dateFormat="dd MMMM yyyy HH:mm"
              placeholderText="Choose date and time"
              minDate={currentDate}
              minTime={minTime}
              maxTime={maxTime}
            />
            <div className="important_box">
              <h5>Is this Toodo important?</h5>
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="checkBox"
                id="checkBox"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
