import firebase from 'firebase/app'
import 'firebase/firestore'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import reportWebVitals from './reportWebVitals'

const firebaseConfig = {
  apiKey: 'AIzaSyCUS1V4vpUDVVwbBFJcyf5twLVLfQEutUQ',
  authDomain: 'playground-163312.firebaseapp.com',
  databaseURL: 'https://playground-163312.firebaseio.com',
  projectId: 'playground-163312',
  storageBucket: 'playground-163312.appspot.com',
  messagingSenderId: '908109866828',
  appId: '1:908109866828:web:64e3cd0a0058ccdd9e51e9',
}
firebase.initializeApp(firebaseConfig)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
