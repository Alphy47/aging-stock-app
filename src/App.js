import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ItemTypes from './components/ItemTypes';
import ExcessInventoryItems from './components/ExcessInventoryItems';
import ProductList from './components/ProductList'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<ItemTypes />} />
        <Route path="/excessInventoryItems" element={<ExcessInventoryItems />} />
        <Route path="/excessInventoryItems/productList" element={<ProductList />} />
      </Routes>
    </Router>
  );
}

export default App;
