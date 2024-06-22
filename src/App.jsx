import { useState, useEffect } from 'react'

import BarChart from './components/BarChart.jsx';
import ScatterPlot from './components/ScatterPlot.jsx';

import './App.scss';

// Cache files
const cache = {
  term_descriptions: './assets/data/term_descriptions.json',
  term_stats: './assets/data/term_stats.json'
}

// Color map
// https://rgbacolorpicker.com/hex-to-rgba
// https://convertcolorcode.com
const colormap = {
  code: {hsla: "hsla(354, 81%, 63%, 0.75)", rgba: "rgba(237, 85, 101, 0.75)"},            // red
  milestone: {hsla: "hsla(10, 97%, 65%, 0.75)", rgba: "rgba(252, 110, 81, 0.75)"},        // orange 
  pipeline: {hsla: "hsla(196, 78%, 61%, 0.75)", rgba: "rgba(79, 193, 233, 0.75)"},        // blue
  software: {hsla: "hsla(89, 56%, 62%, 0.75)", rgba: "rgba(160, 212, 104, 0.75)"},        // green
  tool: {hsla: "hsla(43, 100%, 66%, 0.75)", rgba: "rgba(255, 206, 84, 0.75)"},            // yellow
  workflow: {hsla: "hsla(257, 70%, 75%, 0.75)", rgba: "rgba(172, 146, 236, 0.75)"},       // purple
  "work package": {hsla: "hsla(326, 73%, 73%, 0.75)", rgba: "rgba(236, 135, 192, 0.75)"}, // pink
  other: {hsla: "hsla(217, 15%, 83%, 0.75)", rgba: "rgba(204, 209, 217, 0.75)"}           // grey
}

const App = () => {

  const [barData, setBarData] = useState({});
  const [scatterData, setScatterData] = useState({});

  useEffect(() => {

    const getBarData = async () => {      
      try {
        await fetch (
          cache.term_stats,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        )
        .then((response) => response.json())
        .then((data) => {
          setBarData(storedState => {
            // Run a quick and dirty check to see if data has changed
            if (JSON.stringify(data) == JSON.stringify(storedState)) {
              // no need to update state
              return storedState;
            }
            // update state
            return {...storedState, ...data};
          });
        });
      } catch (error) {
        console.log(error);
      }
    }

    const getScatterData = async () => {
      try {
        await fetch (
          cache.term_descriptions,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        )
        .then((response) => response.json())
        .then((data) => {
          setScatterData(storedState => {
            // Run a quick and dirty check to see if data has changed... maybe...
            if (JSON.stringify(data) == JSON.stringify(storedState)) {
              // no need to update state
              return storedState;
            }
            // update state
            return {...storedState, ...data};
          });
        });
      } catch (error) {
        console.log(error);
      }
    }

    getBarData();
    getScatterData();

    // To enable dynamic/live update of data and visualizations, uncomment the following block and 
    // the 'clearInterval(...)' line in the return statement below.
    /*
    const intervalId = setInterval(() => {
      getBarData();
      getScatterData();
    }, 60000 * 2) // 60000 milliseconds = 1 minute
    */

    // Clean up
    return () => {
      //clearInterval(intervalId);
      setBarData({});
      setScatterData({});
    }

  }, []);

  return (
    <div id='container'>
      <div id='blurb'>
        <h1>Pipelines, workflows, work packages: what's in a word?</h1>
        <p>This is a part of the research work entitled "Pipelines, workflows, work packages: what's in a word: a reflection on metaphors used to design interdisciplinary projects in Digital Humanities" conducted by a team based at the Digital humanities Research Hub, School of Advanced Study, University of London.</p>
        <p>For the DARIAH2024 annual event, we developed a questionnaire and digital poster to engage with the participants, and to gather and visualise community responses in situ.</p>
        <p>The questionnaire aims to capture how the DH community is currently using available terms describing project design, implementation and planning in interdisciplinary Digital Humanities projects. Alongside these evidence-based findings, the team seeks to further assess differences among these concepts by focusing on aspects of interoperability, reproducibility, research planning and interdisciplinary collaboration among team members in DH projects.</p> 
        <div id="qrcode">
          <img id='qrcode' src='./assets/images/qrcode.png' />
          <p><b>We welcome your participation in our short questionnaire. Please scan the QR code or visit https://tinyurl.com/dariah2024</b></p>
        </div>
        <div id='logo'><img src='./assets/images/School_of_Advanced_Study_Logo.png' alt='School of Advanced Study, University of London' /></div>
      </div>
      { scatterData.term_descriptions && scatterData.term_descriptions.length ? <ScatterPlot data={scatterData.term_descriptions} stepped='false' colormap={colormap}/> : null }
      { barData.term_stats && barData.term_stats.length ? <BarChart data={barData.term_stats} colormap={colormap}/> : null }
    </div>
  );

}

export default App;
