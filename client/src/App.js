import React, { useState, useEffect } from "react";

function App() {
  const [fetchedData, setFetchedData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    fetch('http://localhost:2000/', {
      method: 'GET',
    })
    
    .then(response => response.json())
    .then(data => { setFetchedData(data); setLoading(false); })
    .catch((err) => { setError(err); setLoading(false); })
  }

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const inputObject = { url: document.querySelector('.inputUrl').value };

    fetch('http://localhost:2000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputObject),
    })
    .then(response => response.json())
    .then((response) => { 
      if (response.code === 'ENOENT') {
        setError('Invalid URL');
        setLoading(false);
      } else {
        setFetchedData(fetchedData => [response, ...fetchedData ]); 
        setLoading(false); 
      }
    })

    document.querySelector('.formContainer').reset();
  }

  return (
    <div className="App">

      <form className="formContainer" onSubmit={handleUrlSubmit}>
        <input className="inputUrl" type="text" name="inputUrl" placeholder="Image URL" required />
        <input className="inputSubmit" type="submit" value="Submit" />
      </form>

      <div className="infoDisplay">
        { error && <div>{ error }</div> }
        { isLoading && <div>Loading...</div> }
      </div>
      
      <ul className="imageContainer">
        { fetchedData.map(item => 
        <li className="imageItem" key={item._id}>
          <img src={item.url} alt="Result of input" />
          <p>{item.labels.join(', ')}</p>
        </li>)
        }
      </ul>
      
  </div>
  );
}

export default App;
