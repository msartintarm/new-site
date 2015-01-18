from tornado import template

'''
This class stores and retrieves players.
'''
class PlayerStore():

#        def __init__(self, arg1, arg2):
#                self.page = template.Loader('html')
#                web.RequestHandler.__init__(self, arg1, arg2);

        players = {
                "shaloobie": {
                        "name" : "shaloobie",
                        "personal-title" : "Cool Meister"
                },
                "evilishies": {
                        "name" : "evilishies",
                        "personal-title" : "You Da Man"
                },
                "NoName": {
                        "name" : "NoName",
                        "personal-title" : "Doesn't Fit In"
                }

        }


        def add_profile(self, name):
                self.players[name] = {
                        "name" : name,
                        "personal-title" : "You Da Man"
                }

        def get_profile(self, name):

                if not name in self.players:
                        return self.players["Noname"]
                else:
                        return self.players[name]

        def get_all_profiles(self):
                return self.players

