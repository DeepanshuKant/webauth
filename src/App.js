import logo from './logo.svg';
import './App.css';
import Main from './components/Main';
import Dashboard from './Pages/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    // <div className="App">
    //   <Main />
    // </div>

    //Addig a react router dom  
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
