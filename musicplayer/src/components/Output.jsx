import React, { useState, useEffect } from 'react';

const AudioPlayer = ({ audioFiles }) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [audioRef, setAudioRef] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const lastPlayedTrack = localStorage.getItem('lastPlayedTrack');
    const lastPlayedTime = localStorage.getItem('lastPlayedTime');

    if (lastPlayedTrack && audioFiles[lastPlayedTrack]) {
      setCurrentTrack(parseInt(lastPlayedTrack, 10));
      audioRef.currentTime = parseFloat(lastPlayedTime) || 0;
    }
  }, [audioFiles, audioRef]);

  useEffect(() => {
    const saveCurrentState = () => {
      localStorage.setItem('lastPlayedTrack', currentTrack);
      localStorage.setItem('lastPlayedTime', audioRef.currentTime);
    };

    // Event listener to handle playback completion
    const handleEnded = () => {
      saveCurrentState();
      setCurrentTrack((prevTrack) => (prevTrack + 1) % audioFiles.length);
    };

    // Event listener to handle time updates
    const handleTimeUpdate = () => {
      saveCurrentState();
    };

    // Set event listeners
    audioRef.addEventListener('ended', handleEnded);
    audioRef.addEventListener('timeupdate', handleTimeUpdate);

    // Cleanup event listeners on component unmount
    return () => {
      audioRef.removeEventListener('ended', handleEnded);
      audioRef.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioRef, currentTrack, audioFiles]);

  const playPauseHandler = () => {
    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTrackHandler = (direction) => {
    // direction: -1 for previous, 1 for next
    setCurrentTrack((prevTrack) => (prevTrack + direction) % audioFiles.length);
  };

  useEffect(() => {
    // Load the current track when it changes
    audioRef.src = audioFiles[currentTrack];
    audioRef.load();
    audioRef.play();
    setIsPlaying(true);
  }, [currentTrack, audioFiles, audioRef]);

  return (
    <div>
      <h2>Now Playing: {audioFiles[currentTrack]}</h2>
      <audio ref={setAudioRef} controls />
      <div>
        <button onClick={() => skipTrackHandler(-1)}>Previous</button>
        <button onClick={playPauseHandler}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={() => skipTrackHandler(1)}>Next</button>
      </div>
    </div>
  );
};

const App = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      setAudioFiles([...audioFiles, URL.createObjectURL(selectedFile)]);
      setSelectedFile(null);
    }
  };

  return (
    <div>
      <h1>Audio Player App</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {audioFiles.length > 0 && <AudioPlayer audioFiles={audioFiles} />}
    </div>
  );
};

export default App;