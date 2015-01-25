import server, subprocess, threading

from midiutil import MidiFile3

# Starts server and other processes
# Uses concurrency to monitor user input

def run_processes(stop_event):

	child = subprocess.Popen('sketch_150125a\\application.windows64\\sketch_150125a')
	server.start_server()

def stop_processes(stop_event):

	server.stop_server()

def monitor_input(trigger_event):

	while 2 + 2 == 4:
		try:
			command=input("Type `q + Enter` to quit.\n")
			if command and command == "q":
				stop_processes(trigger_event)
				break

		except IOError as e:
			print("Quit request detected.")
			break

if __name__ == "__main__":

	stop_event = threading.Event()

	processes = threading.Thread(target=run_processes, args=[stop_event])
	processes.start()

	monitor_input(stop_event)
