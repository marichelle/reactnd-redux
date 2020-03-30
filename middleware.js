// HELPER FUNCTIONS

function generateId() {
  return (
    Math.random()
      .toString(36)
      .substring(2) + new Date().getTime().toString(36)
  );
}

// APP CODE

const ADD_TODO = 'ADD_TODO';
const RECEIVE_DATA = 'RECEIVE_DATA';
const REMOVE_TODO = 'REMOVE_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const ADD_GOAL = 'ADD_GOAL';
const REMOVE_GOAL = 'REMOVE_GOAL';

// action creators

function handleInitialData() {
  return dispatch =>
    Promise.all([API.fetchTodos(), API.fetchGoals()]).then(function([
      todos,
      goals
    ]) {
      dispatch(receiveDataAction(todos, goals));
    });
}

function addTodoAction(todo) {
  return {
    type: ADD_TODO,
    todo
  };
}

function handleAddTodo(name, cb) {
  return dispatch =>
    API.saveTodo(name)
      .then(todo => {
        cb();
        dispatch(addTodoAction(todo));
      })
      .catch(() => alert('An error occurred. Try again.'));
}

function handleDeleteTodo(todo) {
  // return a function that returns an object
  // instead of returning an object directly!
  return dispatch => {
    // optimistic update
    dispatch(removeTodoAction(todo.id));

    return API.deleteTodo(todo.id).catch(() => {
      // revert if update fails
      alert('An error occurred. Try again.');
      dispatch(addTodoAction(todo));
    });
  };
}

function handleToggle(id) {
  return dispatch => {
    // optimistic update
    dispatch(toggleTodoAction(id));

    return API.saveTodoToggle(id).catch(() => {
      // revert if update fails
      dispatch(toggleTodoAction(id));
      alert('An error occurred. Try again.');
    });
  };
}

function removeTodoAction(id) {
  return {
    type: REMOVE_TODO,
    id
  };
}

function toggleTodoAction(id) {
  return {
    type: TOGGLE_TODO,
    id
  };
}

function addGoalAction(goal) {
  return {
    type: ADD_GOAL,
    goal
  };
}

function handleAddGoal(name, cb) {
  return dispatch =>
    API.saveGoal(name)
      .then(goal => {
        cb();
        dispatch(addGoalAction(goal));
      })
      .catch(() => alert('An error occurred. Try again.'));
}

function handleDeleteGoal(goal) {
  return dispatch => {
    dispatch(removeGoalAction(goal.id));

    return API.deleteGoal(goal.id).catch(() => {
      dispatch(addGoalAction(goal));
      alert('An error occurred. Try again.');
    });
  };
}

function removeGoalAction(id) {
  return {
    type: REMOVE_GOAL,
    id
  };
}

function receiveDataAction(todos, goals) {
  return {
    type: RECEIVE_DATA,
    todos,
    goals
  };
}

// reducers (reducers take the current state and an action and reduces it to a new state via a pure function)

function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return state.concat([action.todo]);

    case RECEIVE_DATA:
      return action.todos;

    case REMOVE_TODO:
      return state.filter(todo => todo.id !== action.id);

    case TOGGLE_TODO:
      // Object.assign() allows us to return a new object with merged properties
      return state.map(todo =>
        todo.id === action.id
          ? Object.assign({}, todo, { complete: !todo.complete })
          : todo
      );

    default:
      return state;
  }
}

function goals(state = [], action) {
  switch (action.type) {
    case ADD_GOAL:
      return state.concat([action.goal]);

    case RECEIVE_DATA:
      return action.goals;

    case REMOVE_GOAL:
      return state.filter(goal => goal.id !== action.id);

    default:
      return state;
  }
}

function loading(state = true, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      return false;

    default:
      return state;
  }
}

const checker = store => next => action => {
  // hijack the dispatch function
  if (
    action.type === ADD_TODO &&
    action.todo.name.toLowerCase().includes('bitcoin')
  ) {
    return alert("Nope. That's a bad idea.");
  }

  if (
    action.type === ADD_GOAL &&
    action.goal.name.toLowerCase().includes('bitcoin')
  ) {
    return alert("Nope. That's a bad idea.");
  }

  return next(action);
};

const logger = store => next => action => {
  const result = next(action);
  console.group(action.type);
  console.log('The action: ', action);
  console.log('The new state: ', store.getState());
  console.groupEnd();
  return result;
};

// DEMO CODE

const store = Redux.createStore(
  Redux.combineReducers({
    todos,
    goals,
    loading
  }),
  Redux.applyMiddleware(ReduxThunk.default, checker, logger)
);
