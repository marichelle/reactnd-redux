class App extends React.Component {
  componentDidMount() {
    const { store } = this.props;

    store.dispatch(handleInitialData());
    store.subscribe(() => this.forceUpdate());
  }

  render() {
    const { store } = this.props;
    const { loading } = store.getState();

    if (loading) {
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

class ConnectedApp extends React.Component {
  render() {
    return (
      <Context.Consumer>{store => <App store={store} />}</Context.Consumer>
    );
  }
}

class ConnectedGoals extends React.Component {
  render() {
    return (
      <Context.Consumer>
        {store => {
          const { goals } = store.getState();

          return <Goals goals={goals} dispatch={store.dispatch} />;
        }}
      </Context.Consumer>
    );
  }
}

class ConnectedTodos extends React.Component {
  render() {
    return (
      <Context.Consumer>
        {store => {
          const { todos } = store.getState();

          return <Todos todos={todos} dispatch={store.dispatch} />;
        }}
      </Context.Consumer>
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

const Context = React.createContext();

class Provider extends React.Component {
  render() {
    return (
      <Context.Provider value={this.props.store}>
        {this.props.children}
      </Context.Provider>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('app')
);
