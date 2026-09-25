import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen';
import ChallengeScreen from './screens/ChallengeScreen';
import Header from './components/Header';
import WordExtractorScreen from './screens/WordExtractorScreen';

function App() {
  return (
    <>
      <Router>
        <Header/>
        <Routes>
          <Route path='/' element={<HomeScreen/>} exact/>
          <Route path='/challenge' element={<ChallengeScreen/>} exact/>
          <Route path='/extractor' element={<WordExtractorScreen/>} exact/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
