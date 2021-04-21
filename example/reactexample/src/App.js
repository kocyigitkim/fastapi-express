import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <form method="post" action="/api/file/upload" enctype="multipart/form-data">
          <input type="file" multiple="true" name="filename" />
          <input type="submit" />
        </form>
      </header>
    </div>
  );
}

export default App;
