// LIBRARY CODE

function createStore(reducer) {
  /*
  The store should have 4 parts:
  1. the state tree (state)
  2. a way to get the state tree (getState())
  3. a way to listen and respond to the state changing (subscribe())
  4. a way to update the state
  */

  // the state
  let state;
  let listeners = [];

  // returns the state
  const getState = () => state;

  // listens for change
  const subscribe = listener => {
    listeners.push(listener);

    return () => {
      listeners = listeners.filter(el => el !== listener);
    };
  };

  // updates the state
  const dispatch = action => {
    state = reducer(state, action);

    // invoke each subscribed listener
    listeners.forEach(listener => listener());
  };

  return {
    getState,
    subscribe,
    dispatch
  };
}

// APP CODE

const ADD_TODO = 'ADD_TODO';
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

function removeGoalAction(id) {
  return {
    type: REMOVE_GOAL,
    id
  };
}

// reducers (reducers take the current state and an action and reduces it to a new state via a pure function)

function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return state.concat([action.todo]);

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

    case REMOVE_GOAL:
      return state.filter(goal => goal.id !== action.id);

    default:
      return state;
  }
}

function app(state = {}, action) {
  // return an object of invoked reducer functions that manage a specific slice of an app's state
  return {
    goals: goals(state.goals, action),
    todos: todos(state.todos, action)
  };
}

// HELPER FUNCTIONS

function generateId() {
  return (
    Math.random()
      .toString(36)
      .substring(2) + new Date().getTime().toString(36)
  );
}

// DEMO CODE

const store = createStore(app);

// subscribe function can be passed a callback function
// to be called whenever the state changes internally

// subscribe listener and return function to unsubscribe listener
const unsubscribe = store.subscribe(() => {
  console.log('This current state is', store.getState());

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
  const button = document.createElement('button');
  const node = document.createElement('li');
  const text = document.createTextNode(todo.name);

  // button label
  button.innerHTML = 'X';
  button.addEventListener('click', () => {
    store.dispatch(removeTodoAction(todo.id));
  });

  // draw list item
  node.appendChild(text);
  node.appendChild(button);

  // toggle todo complete
  node.addEventListener('click', () => {
    store.dispatch(toggleTodoAction(todo.id));
  });

  node.style.textDecoration = todo.complete ? 'line-through' : 'none'; // strikethrough todo item if complete

  // add TODO item to DOM
  document.getElementById('todos').appendChild(node);
}

function addGoalToDOM(goal) {
  const button = document.createElement('button');
  const node = document.createElement('li');
  const text = document.createTextNode(goal.name);

  // button label
  button.innerHTML = 'X';
  button.addEventListener('click', () => {
    store.dispatch(removeGoalAction(goal.id));
  });

  // draw list item
  node.appendChild(text);
  node.appendChild(button);

  document.getElementById('goals').appendChild(node);
}

function removeTodoFromDOM(id) {}

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
