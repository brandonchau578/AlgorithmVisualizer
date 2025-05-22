import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, ChevronDown } from 'lucide-react';
import './App.css';

const AlgorithmVisualizer = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [array, setArray] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [currentStep, setCurrentStep] = useState(0);
  const [comparingIndices, setComparingIndices] = useState([]);
  const [swappingIndices, setSwappingIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);

  // Generate random array
  const generateArray = useCallback((size = 30) => {
    const newArray = Array.from({ length: size }, () => 
      Math.floor(Math.random() * 300) + 10
    );
    setArray(newArray);
    setCurrentStep(0);
    setComparingIndices([]);
    setSwappingIndices([]);
    setSortedIndices([]);
  }, []);

  // Initialize array on component mount
  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Bubble Sort Algorithm
  const bubbleSortSteps = useCallback((arr) => {
    const steps = [];
    const workingArray = [...arr];
    const n = workingArray.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Compare step
        steps.push({
          array: [...workingArray],
          comparing: [j, j + 1],
          swapping: [],
          sorted: Array.from({ length: n - i }, (_, idx) => n - 1 - idx).slice(0, i)
        });

        if (workingArray[j] > workingArray[j + 1]) {
          // Swap step
          [workingArray[j], workingArray[j + 1]] = [workingArray[j + 1], workingArray[j]];
          steps.push({
            array: [...workingArray],
            comparing: [],
            swapping: [j, j + 1],
            sorted: Array.from({ length: n - i }, (_, idx) => n - 1 - idx).slice(0, i)
          });
        }
      }
    }

    // Final step - all sorted
    steps.push({
      array: [...workingArray],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, idx) => idx)
    });

    return steps;
  }, []);

  // Quick Sort Algorithm (simplified visualization)
  const quickSortSteps = useCallback((arr) => {
    const steps = [];
    const workingArray = [...arr];
    
    const quickSort = (low, high, pivotHistory = []) => {
      if (low < high) {
        const pivotIndex = partition(low, high, pivotHistory);
        quickSort(low, pivotIndex - 1, [...pivotHistory, pivotIndex]);
        quickSort(pivotIndex + 1, high, [...pivotHistory, pivotIndex]);
      }
    };

    const partition = (low, high, pivotHistory) => {
      const pivot = workingArray[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        steps.push({
          array: [...workingArray],
          comparing: [j, high],
          swapping: [],
          sorted: pivotHistory
        });

        if (workingArray[j] < pivot) {
          i++;
          if (i !== j) {
            [workingArray[i], workingArray[j]] = [workingArray[j], workingArray[i]];
            steps.push({
              array: [...workingArray],
              comparing: [],
              swapping: [i, j],
              sorted: pivotHistory
            });
          }
        }
      }

      [workingArray[i + 1], workingArray[high]] = [workingArray[high], workingArray[i + 1]];
      steps.push({
        array: [...workingArray],
        comparing: [],
        swapping: [i + 1, high],
        sorted: [...pivotHistory, i + 1]
      });

      return i + 1;
    };

    quickSort(0, workingArray.length - 1);
    
    steps.push({
      array: [...workingArray],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: workingArray.length }, (_, idx) => idx)
    });

    return steps;
  }, []);

  // Linear Search Algorithm
  const linearSearchSteps = useCallback((arr, target) => {
    const steps = [];
    
    for (let i = 0; i < arr.length; i++) {
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        found: arr[i] === target ? i : -1
      });
      
      if (arr[i] === target) {
        break;
      }
    }

    return steps;
  }, []);

  // Get algorithm steps
  const getAlgorithmSteps = useCallback(() => {
    switch (selectedAlgorithm) {
      case 'bubbleSort':
        return bubbleSortSteps(array);
      case 'quickSort':
        return quickSortSteps(array);
      case 'linearSearch':
        const target = array[Math.floor(Math.random() * array.length)];
        return linearSearchSteps(array, target);
      default:
        return [];
    }
  }, [selectedAlgorithm, array, bubbleSortSteps, quickSortSteps, linearSearchSteps]);

  // Animation logic
  useEffect(() => {
    if (!isPlaying) return;

    const steps = getAlgorithmSteps();
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const step = steps[currentStep];
      setArray(step.array);
      setComparingIndices(step.comparing || []);
      setSwappingIndices(step.swapping || []);
      setSortedIndices(step.sorted || []);
      setCurrentStep(prev => prev + 1);
    }, 1000 - speed * 9);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, getAlgorithmSteps]);

  const handlePlay = () => {
    if (currentStep >= getAlgorithmSteps().length) {
      reset();
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setComparingIndices([]);
    setSwappingIndices([]);
    setSortedIndices([]);
    generateArray();
  };

  const getBarColor = (index) => {
    if (sortedIndices.includes(index)) return 'bar-sorted';
    if (swappingIndices.includes(index)) return 'bar-swapping';
    if (comparingIndices.includes(index)) return 'bar-comparing';
    return 'bar-default';
  };

  const algorithms = [
    { value: 'bubbleSort', label: 'Bubble Sort', description: 'Compares adjacent elements and swaps them if they are in wrong order' },
    { value: 'quickSort', label: 'Quick Sort', description: 'Divides array into partitions around a pivot element' },
    { value: 'linearSearch', label: 'Linear Search', description: 'Searches for an element by checking each element sequentially' }
  ];

  const getComplexityInfo = () => {
    switch (selectedAlgorithm) {
      case 'bubbleSort':
        return [
          { type: 'time', title: 'Time Complexity', value: 'O(n²) - Worst/Average Case' },
          { type: 'space', title: 'Space Complexity', value: 'O(1) - Constant' },
          { type: 'best', title: 'Best Case', value: 'O(n) - Already sorted' }
        ];
      case 'quickSort':
        return [
          { type: 'average', title: 'Time Complexity', value: 'O(n log n) - Average Case' },
          { type: 'space', title: 'Space Complexity', value: 'O(log n) - Recursive' },
          { type: 'time', title: 'Worst Case', value: 'O(n²) - Poor pivot' }
        ];
      case 'linearSearch':
        return [
          { type: 'time', title: 'Time Complexity', value: 'O(n) - Linear' },
          { type: 'space', title: 'Space Complexity', value: 'O(1) - Constant' },
          { type: 'best', title: 'Best Case', value: 'O(1) - First element' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="algorithm-visualizer">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>Algorithm Visualizer</h1>
          <p>
            Interactive visual representations of common algorithms to help you understand how they work
          </p>
        </div>

        {/* Controls */}
        <div className="controls-panel">
          <div className="controls-grid">
            {/* Algorithm Selection */}
            <div className="algorithm-selection">
              <label>Choose Algorithm</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => {
                    setSelectedAlgorithm(e.target.value);
                    reset();
                  }}
                  className="algorithm-select"
                >
                  {algorithms.map(alg => (
                    <option key={alg.value} value={alg.value}>
                      {alg.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-arrow" size={20} />
              </div>
            </div>

            {/* Speed Control */}
            <div className="speed-control">
              <label>Speed: {speed}%</label>
              <input
                type="range"
                min="10"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="speed-slider"
              />
            </div>

            {/* Control Buttons */}
            <div className="control-buttons">
              <button onClick={handlePlay} className="btn btn-primary">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={reset} className="btn btn-secondary">
                <RotateCcw size={20} />
                Reset
              </button>
            </div>

            {/* Generate New Array */}
            <div>
              <button
                onClick={() => generateArray()}
                className="btn btn-success"
              >
                <Settings size={20} />
                New Array
              </button>
            </div>
          </div>

          {/* Algorithm Description */}
          <div className="algorithm-description">
            <h3>{algorithms.find(alg => alg.value === selectedAlgorithm)?.label}</h3>
            <p>{algorithms.find(alg => alg.value === selectedAlgorithm)?.description}</p>
          </div>
        </div>

        {/* Visualization */}
        <div className="visualization-panel">
          <div className="visualization-header">
            <h2>Visualization</h2>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-color legend-default"></div>
                <span>Default</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-comparing"></div>
                <span>Comparing</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-swapping"></div>
                <span>Swapping</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-sorted"></div>
                <span>Sorted</span>
              </div>
            </div>
          </div>

          {/* Array Visualization */}
          <div className="array-container">
            {array.map((value, index) => (
              <div
                key={index}
                className={`array-bar ${getBarColor(index)}`}
                style={{
                  height: `${Math.max(value / 300 * 250, 20)}px`,
                  width: `${Math.max(800 / array.length - 2, 8)}px`
                }}
              >
                {array.length <= 20 && (
                  <span className="bar-value">{value}</span>
                )}
              </div>
            ))}
          </div>

          {/* Progress Info */}
          <div className="progress-section">
            <div className="progress-info">
              Step: {currentStep} / {getAlgorithmSteps().length}
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{
                  width: `${getAlgorithmSteps().length > 0 ? (currentStep / getAlgorithmSteps().length) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Algorithm Complexity Information */}
        <div className="complexity-panel">
          <h2>Algorithm Complexity</h2>
          <div className="complexity-grid">
            {getComplexityInfo().map((info, index) => (
              <div key={index} className={`complexity-card complexity-${info.type}`}>
                <h3>{info.title}</h3>
                <p>{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;