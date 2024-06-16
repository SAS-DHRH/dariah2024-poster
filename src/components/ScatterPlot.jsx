import { useState, useEffect, useRef } from 'react'
import { UMAP } from 'umap-js';
import { ScatterGL } from 'scatter-gl';

const UMAPify = function* (data, params) {

  // umap-js
  // https://github.com/PAIR-code/umap-js/blob/master/README.md#parameters

  const default_params = {
    nComponents: 2, 
    nNeighbors: 2, 
    minDist: 0.1
  },
  options = {...default_params, ...params};

  const umap = new UMAP({
    nComponents: options.nComponents,
    nNeighbors: options.nNeighbors,
    minDist: options.minDist  
  });

  const nEpochs = umap.initializeFit(data);
  for (let i = 0; i < nEpochs; i++) {
      umap.step();
      if (i % 5 === 0) yield umap.getEmbedding();
  }
  yield umap.getEmbedding();

}

const ScatterPlot = (props) => {

  const [isBusy, setBusy] = useState(true);
  const canvas = useRef();

  useEffect(() => {

    if (props.data !== undefined && props.data.length) {

      // Clear the canvas
      canvas.current.replaceChildren();

      // Prep data
      const descriptions = props.data;
      const vectors = descriptions.map((item) => {
        return item.embedding;
      }),
      metadata = descriptions.map((item) => {
        return { label: item.description };
      }),
      colors = descriptions.map((item) => props.colormap[item.term].hsla);

      // Set up visualization
      // scatter-gl
      // https://github.com/PAIR-code/scatter-gl?tab=readme-ov-file#parameters
      // label style: https://github.com/PAIR-code/scatter-gl/blob/fd51893bf19deb3faa4a30f95966011006ced5fc/src/styles.ts#L131
      // point style: https://github.com/PAIR-code/scatter-gl/blob/fd51893bf19deb3faa4a30f95966011006ced5fc/src/styles.ts#L153
      const scatterGL = new ScatterGL(canvas.current, {
        showLabelsOnHover: false,
        selectEnabled: false,
        orbitControls: {
          autoRotateSpeed: 2
        },
        styles: {
          axesVisible: false,
          label: {
            fontSize: 8
          },
          point: {
            scaleDefault: 2.5,
            scaleSelected: 2.5,
            scaleHover: 2.5,
          }
        }
      });
      scatterGL.setPointColorer(function (i, selectedIndices, hoverIndex) {
        return colors[i];
      })

      // Add dblclick lister to allow restarting animation
      canvas.current.addEventListener('dblclick', () => {
        if (!scatterGL.isOrbiting()) {
          scatterGL.startOrbitAnimation();
        }
      })

      // Add resize listener for automatic window resize.
      window.addEventListener('resize', () => {
        scatterGL.resize();
      });

      // Vectorize with UMAP and visualize
      const umap_options = {
        nComponents: 3, 
        nNeighbors: 5, 
        minDist: 0.75
      }
      if (props.stepped == undefined || props.stepped == 'true') {
        const umap_vectors = UMAPify(
          vectors, 
          umap_options
        );
        let iteration = umap_vectors.next();
        while(!iteration.done) {
          const dataset = new ScatterGL.Dataset(iteration.value, metadata);
          scatterGL.render(dataset);
          iteration = umap_vectors.next();
        }
      } else {
        const umap = new UMAP(
          umap_options
        );
        const umap_vectors = umap.fit(vectors);
        const dataset = new ScatterGL.Dataset(umap_vectors, metadata);
        scatterGL.render(dataset);
      }

    }
    
    // Clean up
    return () => {
      setBusy(true);
    }
  
  }, [props]);

  return (
    <div id='scatterplot'>
      <div className='figure' ref={canvas}></div>
      <div className='legend'>
        <p>What do the terms 'pipeline', 'workflow' and 'work package' mean to you?</p>
        <p><span className='dot blue'></span> pipeline</p>
        <p><span className='dot purple'></span> workflow</p>
        <p><span className='dot pink'></span> work package</p>
      </div>
    </div>
  );

}

export default ScatterPlot;