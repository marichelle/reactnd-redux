class App extends React.Component {
  componentDidMount() {
    const { store } = this.props;

    store.subscribe(() => this.forceUpdate());
  }

  render() {
    const { store } = this.props;
    const { todos, goals } = store.getState();

    return (
      <div>
        <Todos todos={todos} store={this.props.store} />
        <Goals goals={goals} store={this.props.store} />
      </div>
    );
  }
}

class Goals extends React.Component {
  addGoal = e => {
    e.preventDefault();

    const name = this.input.value;

    this.input.value = '';

    this.props.store.dispatch(
      addGoalAction({
        name,
        id: generateId()
      })
    );
  };

  handleRemoveItem = item => {
    this.props.store.dispatch(removeGoalAction(item.id));
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

    const name = this.input.value;

    this.input.value = '';

    this.props.store.dispatch(
      addTodoAction({
        name,
        complete: false,
        id: generateId()
      })
    );
  };

  handleRemoveItem = item => {
    this.props.store.dispatch(removeTodoAction(item.id));
  };

  handleToggleItem = item => {
    this.props.store.dispatch(toggleTodoAction(item.id));
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

ReactDOM.render(<App store={store} />, document.getElementById('app'));
