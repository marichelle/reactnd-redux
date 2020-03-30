class App extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch(handleInitialData());
  }

  render() {
    if (this.props.loading) {
      return <h3>Loading...</h3>;
    }

    return (
      <div>
        <ConnectedTodos />
        <ConnectedGoals />
      </div>
    );
  }
}

class Goals extends React.Component {
  addGoal = e => {
    e.preventDefault();

    // pass a callback in order to invoke the same "clear form field"
    // functionality within the handleAddGoal() action creator
    this.props.dispatch(
      handleAddGoal(this.input.value, () => (this.input.value = ''))
    );
  };

  handleRemoveItem = item => {
    this.props.dispatch(handleDeleteGoal(item));
  };

  render() {
    return (
      <div>
        <h1>Goals</h1>
        {/* Uncontrolled Component */}
        <input
          type="text"
          placeholder="Add goal"
          ref={input => (this.input = input)}
        />
        <button onClick={this.addGoal}>Add Goal</button>
        <List items={this.props.goals} onRemoveItem={this.handleRemoveItem} />
      </div>
    );
  }
}

class Todos extends React.Component {
  handleAddItem = e => {
    e.preventDefault();

    // pass a callback in order to invoke the same "clear form field"
    // functionality within the handleSaveTodo() action creator
    this.props.dispatch(
      handleAddTodo(this.input.value, () => (this.input.value = ''))
    );
  };

  handleRemoveItem = item => {
    this.props.dispatch(handleDeleteTodo(item));
  };

  handleToggleItem = item => {
    this.props.dispatch(handleToggle(item.id));
  };

  render() {
    return (
      <div>
        <h1>Todo List</h1>
        {/* Uncontrolled Component */}
        <input
          type="text"
          placeholder="Add Todo"
          ref={input => (this.input = input)}
        />
        <button onClick={this.handleAddItem}>Add Todo</button>
        <List
          items={this.props.todos}
          onRemoveItem={this.handleRemoveItem}
          onToggleItem={this.handleToggleItem}
        />
      </div>
    );
  }
}

/*
    Currying technique is used here. When connect()
    is invoked, it returns a function.

    1st set of parens: data the component needs
    2nd set of parens: pass the component to render
*/
const ConnectedApp = ReactRedux.connect(state => ({
  loading: state.loading
}))(App);

const ConnectedGoals = ReactRedux.connect(state => ({
  goals: state.goals
}))(Goals);

const ConnectedTodos = ReactRedux.connect(state => ({
  todos: state.todos
}))(Todos);

const List = props => {
  return (
    <ul>
      {props.items.map(item => (
        <li key={item.id}>
          {item.complete !== undefined && (
            <span
              onClick={() => props.onToggleItem && props.onToggleItem(item)}
              style={{
                textDecoration: item.complete ? 'line-through' : 'none'
              }}
            >
              {item.name}
            </span>
          )}
          {item.complete === undefined && <span>{item.name}</span>}
          <button onClick={() => props.onRemoveItem(item)}>X</button>
        </li>
      ))}
    </ul>
  );
};

ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <ConnectedApp />
  </ReactRedux.Provider>,
  document.getElementById('app')
);
