//@ts-nocheck
import React, {useState, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {WebView} from 'react-native-webview';
import Slider from '@react-native-community/slider'; // Importing Slider

const frequencies = {
  Fly: {
    frequency: 16000,
    icon: 'https://img.icons8.com/?size=100&id=6561&format=png&color=000000',
  },
  Mosquito: {
    frequency: 17000,
    icon: 'https://img.icons8.com/?size=100&id=4464&format=png&color=000000',
  },
  Cat: {
    frequency: 18000,
    icon: 'https://img.icons8.com/?size=100&id=NAb5cx6yKB_A&format=png&color=000000',
  },
  Dog: {
    frequency: 19000,
    icon: 'https://img.icons8.com/?size=100&id=39539&format=png&color=000000',
  },
  Rat: {
    frequency: 21000,
    icon: 'https://img.icons8.com/?size=100&id=41034&format=png&color=000000',
  },
  Snake: {
    frequency: 15000,
    icon: 'https://img.icons8.com/?size=100&id=4647&format=png&color=000000',
  },
};

const melodyNotes = [
  {frequency: 262, duration: 500}, // C note
  {frequency: 294, duration: 500}, // D note
  {frequency: 330, duration: 500}, // E note
  {frequency: 349, duration: 500}, // F note
  {frequency: 392, duration: 500}, // G note
  {frequency: 440, duration: 500}, // A note
  {frequency: 494, duration: 500}, // B note
  {frequency: 523, duration: 500}, // High C note
];

const AnimalRepellentApp = () => {
  const webviewRef = useRef(null);
  const [activeAnimal, setActiveAnimal] = useState(null); // Track the currently active animal
  const [isMuted, setIsMuted] = useState(false); // Track mute state
  const [volume, setVolume] = useState(0.5); // Track volume state (50%)

  const toggleSound = (animal, frequency) => {
    if (activeAnimal === animal) {
      // Stop the sound if the same button is clicked again
      stopSound();
      setActiveAnimal(null);
    } else {
      // Stop any existing sound before starting a new one
      stopSound();
      playSound(frequency, volume);
      setActiveAnimal(animal);
    }
  };

  const playSound = (frequency, vol) => {
    const playScript = `
      if (window.oscillator) {
        window.oscillator.stop(); // Ensure any previous oscillator is stopped
      }
      var context = new (window.AudioContext || window.webkitAudioContext)();
      window.gainNode = context.createGain();
      window.gainNode.gain.setValueAtTime(${vol}, context.currentTime); // Set initial volume
      window.oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(${frequency}, context.currentTime);
      oscillator.connect(gainNode).connect(context.destination);
      oscillator.start();
    `;
    webviewRef.current.injectJavaScript(playScript);
  };

  const playMelody = () => {
    let melodyScript = `
      if (window.oscillator) {
        window.oscillator.stop(); // Stop previous sound if any
      }
      var context = new (window.AudioContext || window.webkitAudioContext)();
      window.gainNode = context.createGain();
      window.gainNode.gain.setValueAtTime(${volume}, context.currentTime);
      window.oscillator = context.createOscillator();
      oscillator.type = 'sine';
    `;

    melodyNotes.forEach((note, index) => {
      melodyScript += `
        setTimeout(() => {
          window.oscillator.frequency.setValueAtTime(${
            note.frequency
          }, context.currentTime);
        }, ${index * note.duration});
      `;
    });

    melodyScript += `
      oscillator.connect(gainNode).connect(context.destination);
      oscillator.start();
      setTimeout(() => {
        window.oscillator.stop(); // Stop after the melody finishes
      }, ${melodyNotes.length * 500});
    `;

    webviewRef.current.injectJavaScript(melodyScript);
  };

  const stopSound = () => {
    const stopScript = `
      if (window.oscillator) {
        window.oscillator.stop();
        window.oscillator = null; // Clear the oscillator reference
      }
    `;
    webviewRef.current.injectJavaScript(stopScript);
  };

  const toggleMute = () => {
    const muteScript = isMuted
      ? `window.gainNode.gain.setValueAtTime(${volume}, 0);` // Unmute by setting volume back
      : `window.gainNode.gain.setValueAtTime(0, 0);`; // Mute by setting gain to 0
    webviewRef.current.injectJavaScript(muteScript);
    setIsMuted(!isMuted);
  };

  const adjustVolume = value => {
    setVolume(value);
    const volumeScript = `window.gainNode.gain.setValueAtTime(${value}, 0);`;
    webviewRef.current.injectJavaScript(volumeScript);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animal Repellent</Text>
      <View style={styles.buttonContainer}>
        {/* Oscillator Buttons */}
        {Object.keys(frequencies).map(animal => (
          <TouchableOpacity
            key={animal}
            style={[
              styles.button,
              activeAnimal === animal && styles.activeButton, // Highlight the active button
            ]}
            onPress={() => toggleSound(animal, frequencies[animal].frequency)}>
            <Image
              source={{uri: frequencies[animal].icon}}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>{animal}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mute Button */}
      <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
        <Text style={styles.muteButtonText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
      </TouchableOpacity>

      {/* Play Melody Button */}
      <TouchableOpacity style={styles.melodyButton} onPress={playMelody}>
        <Text style={styles.muteButtonText}>Play Melody</Text>
      </TouchableOpacity>

      {/* Volume Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>
          Volume: {Math.round(volume * 100)}%
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={volume}
          onValueChange={adjustVolume} // Update volume when slider moves
        />
      </View>

      <WebView
        ref={webviewRef}
        style={{display: 'none'}} // Hide the WebView
        source={{html: '<html><body></body></html>'}} // Empty HTML, will inject JavaScript
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    // backgroundColor: '#4CAF50',
    backgroundColor: 'grey',
    border: '1px solid black',
    borderWidth: 5,
    margin: 10,
    borderRadius: 10,
    width: 100,
  },
  activeButton: {
    backgroundColor: '#FF5722', // Change color when active
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  muteButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  muteButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  melodyButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  sliderContainer: {
    marginTop: 20,
    width: '80%',
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
  },
});

export default AnimalRepellentApp;
