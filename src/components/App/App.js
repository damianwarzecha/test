import React, {useState} from 'react';
import './App.css';
import ProductList from "../product-list";
import {MessagesProvider} from "../Utils/Message";

const App = () => {
    const [total, setTotal] = useState(0);

  return (
    <div className="container">
      <h3>Lista produktów</h3>
        <MessagesProvider>
            <ProductList totalCall={(total) => {
                setTotal(total.toFixed(2));
            }}/>
        </MessagesProvider>
        <ul>
            <li className="row">Suma, cena: {total.toString().replace('.', ',')}zł</li>
        </ul>
    </div>
  );
};

export {
    App
};
