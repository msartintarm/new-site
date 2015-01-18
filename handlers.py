import os.path
from tornado import web, template, websocket
from config import GameConfig
from store import PlayerStore

OS = os.path.dirname(__file__)
DEBUG=True
GZIP=True

def server_path(uri):
        return os.path.join(OS, uri)

def html_path(uri):
        return os.path.join(OS, "html/" + uri)

def static_path(uri):
	return { "path": server_path("static/" + uri) }

level_1 = GameConfig()

class Tarm(web.RequestHandler):

        def __init__(self, arg1, arg2):
                self.page = template.Loader('html')
                web.RequestHandler.__init__(self, arg1, arg2);

        def get(self):
                self.render(html_path("main.html"))

        def write_error(self, code, **kwargs):
                self.render(html_path("error.html"))

class Fallback(web.RequestHandler):

        def get(self):
                self.render(html_path("error.html"))

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
                        self.return_message('config.html', config=level_1)
                elif "player-name" in message:
                        players.pool.addPlayer(message[message.find("?")+1:])
                elif "add-profile-" in message:
                        client_profile = PlayerStore().get_profile(message[ message.rfind("-") + 1: ])
                        client_profiles = PlayerStore().get_all_profiles()
                        self.return_message("tarm-profile.html", 
                                client=client_profile,
                                everyone=client_profiles)

                elif "get-profile-" in message:
                        client_profile = PlayerStore().get_profile(message[ message.find("-") + 1: ])
                        self.return_message("tarm-profile.html", 
                                client=client_profile)

