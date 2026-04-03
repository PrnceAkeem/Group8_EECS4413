import { Link } from 'react-router-dom';

function ScaffoldPage({ title, description, tasks = [] }) {
  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>{title}</h1>
        <Link to="/catalog" className="header-link filled">Back to Store</Link>
      </header>

      <section className="panel stack-gap">
        <p>{description}</p>

        {tasks.length > 0 && (
          <>
            <h3>Team TODO</h3>
            <ul className="todo-list">
              {tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

export default ScaffoldPage;
