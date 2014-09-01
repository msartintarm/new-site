import re, json

# CONFIGURATION : Structure of audio
# Origin URL, destination node, loop[, loop offset, loop time])
#  These are at 120 BPM: 1 sec = 2 beats
# 0. Low-pass input detects movement, occuring on the half-beat; slightly below 0.25s
# 1. Non-looping sound, which will be triggered by the above sample
# 2. Non-looping sound, which will be triggered by the above sample
# 3. Rest of the song.
# CONFIGURATION : Structure of pieces
# Syntax: name, texture, array of x-y coordinate strings
#  String values can either be absolute, or relative to prev. strings
#  Can also specify loops of continuous increments
 
level = {
	"grid-size": 75,
  "textures": ["brick.jpg", "heaven.jpg", "rug.jpg", "heaven_Normal.jpg", "brick_normal.jpg"],
  "audio": [
  	["music/beats.mp3", "audio-low-pass", "loop", "1", "8"],
    ["music/move.wav", "audio-output"],
    ["music/jump1.wav", "audio-output"],
    ["music/jump2.wav", "audio-output"],
    ["music/jump3.wav", "audio-output"],
    ["music/jump4.wav", "audio-output"],
    ["music/background.wav", "audio-delay", "loop", "0", "8"]
  ], "pieces": [
  	["floor", "rug.jpg", "1", "3", ["-11,-1", "20*(+1,+0)"]],
  	["chameleon", "heaven.jpg", "1", "1", ["0,3","0,7","0,11"]],
  	["wall", "brick.jpg", "1", "1", [
			"6,3", "+1,+1", "+1,+1", "+1,+1", "12*(+1,+0)",
			"+4,-2", "4*(+2,+0)",
			"-4,+2", "4*(-2,+0)",
			"+4,-2", "4*(+2,+0)",
			"-4,+2", "4*(-2,+0)",
			"+2,-3", "20*(+1,+0)"]]],
	"start-position": ["0", "300", "750"],
	"triggers": { 
    # audio triggers: piece name, piece index, name of audio
  	"audio": [
	  	["floor", "0", "music/trigger1.wav"],
	  	["floor", "10", "music/trigger2.wav"],
	  	["floor", "20", "music/trigger3.wav"]
		],
		# bullet triggers: piece name, piece index, direction of bullet (NSWE)
		"bullet": [
	  	["chameleon", "0", "N"],
	  	["chameleon", "1", "S"],
	  	["chameleon", "2", "E"]
		]
	}
}

regex = re.compile(r"(?:([0-9]+)\*\()?([-+])*([0-9]+)\,([-+])*([0-9]+)\)?")

class GameConfig():

	def __init__(self):

		self.squares = {}
		self.pieces = []
		self.audio = level["audio"]
		self.textures = level["textures"]
		self.start = level["start-position"]
		self.grid_size = level["grid-size"]
		self.start_position = level["start-position"]

		# Either op doesn't exist (val), is a '-' (= dec old), or is  a '+' (= inc old)
		def newCoordVal(old, op, val):
			if op == None:
				return int(val)
			if op == "-":
				 return old - int(val)
			if op == "+":
				return old + int(val)
			return -1

		for i, piece in enumerate(level["pieces"]):

			# Parse coordinates into map. Can be specified as absolute, 
			#  or in [loops of] offsets. Will be enumerated over in rendering.
			x = 0
			y = 0
			squares = {}
			for coord in piece[4]:

				result = regex.search(coord)

                # Index 1: loop count (opt); 2, 4: inc sign (opt); 3, 5: value (non-opt)
				loop = 1
				if result.group(1):
					loop = int(result.group(1))
				j = 0
				while j < loop:

					x = newCoordVal(x, result.group(2), result.group(3))
					y = newCoordVal(y, result.group(4), result.group(5))

					if not y in squares:
						squares[y] = {};
					squares[y][x] = i
					j += 1


        	# Use info to construct config object
			self.pieces.append({
				"name": piece[0],
				"texture": piece[1],
				"squares": squares.copy(),
				"width": piece[2],
				"height": piece[3]
			});

		print(self.pieces)

	def toString(self):
		return json.dumps(level)

