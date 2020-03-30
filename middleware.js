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

/* replaced by Redux.combineReducers()
function app(state = {}, action) {
  // return an object of invoked reducer functions that manage a specific slice of an app's state
  return {
    goals: goals(state.goals, action),
    todos: todos(state.todos, action)
  };
} */

// MIDDLEWARE

/* // replace es5 with es6
function checker(store) {
  return function(next) {
    return function(action) {};
  };
} */

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

// example of how ReduxThunk middleware works
/* const thunk = store => next => action => {
  if (typeof action === 'function') {
    return action(store.dispatch);
  }

  return next(action);
}; */

// DEMO CODE

const store = Redux.createStore(
  Redux.combineReducers({
    todos,
    goals,
    loading
  }),
  Redux.applyMiddleware(ReduxThunk.default, checker, logger)
);

/*

// subscribe function can be passed a callback function
// to be called whenever the state changes internally

// subscribe listener and return function to unsubscribe listener
const unsubscribe = store.subscribe(() => {
  const { goals, todos } = store.getState();

  // reset DOM
  document.getElementById('goals').innerHTML = '';
  document.getElementById('todos').innerHTML = '';

  // update DOM
  goals.forEach(goal => addGoalToDOM(goal));
  todos.forEach(todo => addTodoToDOM(todo));
});

// unsubscribe listener
// unsubscribe();

// DOM CODE

function addTodoToDOM(todo) {
  const node = document.createElement('li');
  const text = document.createTextNode(todo.name);
  const removeBtn = createRemoveButton(() =>
    store.dispatch(removeTodoAction(todo.id))
  );

  // draw list item
  node.appendChild(text);
  node.appendChild(removeBtn);

  // toggle todo complete
  node.addEventListener('click', () => {
    store.dispatch(toggleTodoAction(todo.id));
  });

  node.style.textDecoration = todo.complete ? 'line-through' : 'none'; // strikethrough todo item if complete

  // add TODO item to DOM
  document.getElementById('todos').appendChild(node);
}

function addGoalToDOM(goal) {
  const node = document.createElement('li');
  const text = document.createTextNode(goal.name);
  const removeBtn = createRemoveButton(() =>
    store.dispatch(removeGoalAction(goal.id))
  );

  // draw list item
  node.appendChild(text);
  node.appendChild(removeBtn);

  document.getElementById('goals').appendChild(node);
}

function createRemoveButton(clickHandler) {
  const removeBtn = document.createElement('button');

  // button label
  removeBtn.innerHTML = 'X';

  // click handler
  removeBtn.addEventListener('click', clickHandler);

  return removeBtn;
}

// event handlers

function addTodo() {
  const input = document.getElementById('todo');
  const name = input.value;

  // reset val
  input.value = '';

  store.dispatch(
    addTodoAction({
      id: generateId(),
      name,
      complete: false
    })
  );
}

function addGoal() {
  const input = document.getElementById('goal');
  const name = input.value;

  // reset val
  input.value = '';

  store.dispatch(
    addGoalAction({
      id: generateId(),
      name
    })
  );
}

// event listeners
document.getElementById('todoBtn').addEventListener('click', addTodo);
document.getElementById('goalBtn').addEventListener('click', addGoal);

*/
