
# One server-side representation of player object
class TarmPlayer():
        def __init__(self, name):
                self.name = name

        def update(self, new_name):
                self.name = new_name

global_players = {}

class pool():

#	def __init__(self):

        
        def addPlayer(new_name):
                if new_name in global_players:
                        print("Name ", new_name, " already taken.")
                else:
                        global_players[new_name] = TarmPlayer(new_name)
        def getPlayers():
                return global_players
                                
