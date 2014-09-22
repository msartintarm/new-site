import os.path
from tornado import ioloop, httpserver, web, websocket, template
from config import GameConfig

OS = os.path.dirname(__file__)

def server_path(uri):
	return os.path.join(OS, uri)

def static_path(uri):
	return { "path": server_path("static/" + uri) }

level_1 = GameConfig()

# One server-side representation of player object
class TarmPlayer():
	def __init__(self, name):
		self.name = name

	def update(self, new_name):
		self.name = new_name


class PlayerPool():

	def __init__(self):
		self.players = {}

	def addPlayer(self, new_name):
		if new_name in self.players:
			print("Can't take this name, bro. It's already in existence.")
			return
		self.players[new_name] = TarmPlayer(new_name)

players = PlayerPool()

class TarmHandler(web.RequestHandler):

	def __init__(self, arg1, arg2):
		self.page = template.Loader('html')
		web.RequestHandler.__init__(self, arg1, arg2);

	def get(self):
		players.addPlayer("Evilishies")
		self.render(server_path("html/main.html"),config = level_1)
#		self.render(server_path("html/main.html"), )

	def write_error(self, code, **kwargs):
		self.render(server_path("html/error.html"))

class FallbackHandler(web.RequestHandler):

	def get(self):
		self.render(server_path("html/error.html"))


#  websocket that sits open and intercepts incoming messages from user devices
class TarmSocket(websocket.WebSocketHandler):

	def open(self, *args):
		self.stream.set_nodelay(True)
		print("Socket opened.")

	def return_message(self, html_page, **args):
		self.write_message(template.Loader('html').load(html_page).generate(**args))

	def on_message(self, message):
		print("Message from browser:", message)
		if "load-config" in message:
			self.return_message('config.html',config=level_1)
		elif "load-about" in message:
			self.return_message('about.html')
		elif "load-audio" in message:
			self.return_message('audio.html')
		elif "load-players" in message:
			self.return_message('playerInfo.html',players=players)
		elif "load-game" in message:
			self.return_message('game.html')
		elif "player-name" in message:
			players.addPlayer(message[message.find("?")+1:])

def start_server():

	tarm_app = web.Application(handlers=[
		(r"/", TarmHandler),
		(r"/socket", TarmSocket),
	    (r"/images/(.*)", web.StaticFileHandler, static_path("images")),
	    (r"/textures/(.*)", web.StaticFileHandler, static_path("textures")),
	    (r"/music/(.*)", web.StaticFileHandler, static_path("audio")),
	    (r".*", FallbackHandler)
	    ],
	    debug=True, gzip=True, static_path=server_path("static"))

	httpserver.HTTPServer(tarm_app).listen(8000)
	print("Starting server.")
	ioloop.IOLoop.instance().start()

if __name__ == "__main__":
	start_server()
