from tornado import template

class PlayerStore():

        def __init__(self, arg1, arg2):
                self.page = template.Loader('html')
                web.RequestHandler.__init__(self, arg1, arg2);

        def get_profile(name):
                return {
                        "name" : name,
                        "personal-title" : "You Da Man"
                        };

