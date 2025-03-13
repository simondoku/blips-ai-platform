// client/src/testAPI.js
import axios from 'axios';

axios.get('http://localhost:5001/api/test')
  .then(response => {
    console.log('API Test Success:', response.data);
  })
  .catch(error => {
    console.error('API Test Error:', error);
  });