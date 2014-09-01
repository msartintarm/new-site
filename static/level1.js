{
        //            CONFIGURATION
  "grid-size": 50,
  "textures": ["brick-texture", "heaven-texture", "rug-texture"],
  // Origin URL, destination node, loop[, loop offset, loop time])
  // These are at 120 BPM: 1 sec = 2 beats
  // 0. Low-pass input detects movement, occuring on the half-beat; slightly below 0.25s
  // 1. Non-looping sound, which will be triggered by the above sample
  // 2. Non-looping sound, which will be triggered by the above sample
  // 3. Rest of the song.
  "audio": [["music/beats.mp3", "audio-low-pass", "loop", "1", "8"],
    ["music/move.wav", "audio-output"],
    ["music/jump1.wav", "audio-output"],
    ["music/jump2.wav", "audio-output"],
    ["music/jump3.wav", "audio-output"],
    ["music/jump4.wav", "audio-output"],
    ["music/background.wav", "audio-delay", "loop", "0", "8"]],
  // Syntax of pieces: name, texture, array of x-y coordinate strings
  // String values can either be absolute, or relative to prev. strings
  // Can also specify loops of continuous increments
  "piece-0": ["floor", "rug-texture", "1", "3", ["-11,-1", "20*(+1,+0)"]],
  "piece-1": ["wall", "brick-texture", "1", "1", ["6,3", "+1,+1", "+1,+1", "+1,+1", "12*(+1,+0)",
    "+4,-2", "4*(+2,+0)",
    "-4,+2", "4*(-2,+0)",
    "+4,-2", "4*(+2,+0)",
    "-4,+2", "4*(-2,+0)",
    "+2,-3", "20*(+1,+0)"]],
  "start-position": ["0", "300", "750"]
}

