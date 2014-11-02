import os.path
from tornado import ioloop, httpserver, web, websocket, template
import handlers
import players

DEBUG=True
GZIP=True


def start_server():

	tarm_app = web.Application(handlers=[
		(r"/", handlers.Tarm),
		(r"/socket", handlers.TarmSocket),
	    (r"/images/(.*)", web.StaticFileHandler, handlers.static_path("images")),
	    (r"/textures/(.*)", web.StaticFileHandler, handlers.static_path("textures")),
	    (r"/music/(.*)", web.StaticFileHandler, handlers.static_path("audio")),
	        (r".*", handlers.Fallback)
	    ],
	    debug=DEBUG, gzip=GZIP, static_path=handlers.server_path("static"))

	httpserver.HTTPServer(tarm_app).listen(8000)
	print("Starting server.")
	ioloop.IOLoop.instance().start()

if __name__ == "__main__":
	start_server()
