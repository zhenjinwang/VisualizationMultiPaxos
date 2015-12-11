Visualization Of MultiPaxos

    A Node app to visualize the VR Multi Paxos, and it will be extended to visualize 
    all distribute algorithms which are implemented in DistAlgo to help understand distributed algorithm.
  
Requirements:
    
    1.  For Running DistAlgo: a very high-level language for programming distributed algorithms. 
            Python version 3.4 or higher 
            More: https://github.com/DistAlgo/distalgo
            
    2.  For Running App:  This app uses Node v5.0.0 and NPM 3.3.12
    
Running App:

    1)  git clone https://github.com/zhenjinwang/VisualizationMultiPaxos.git
    2)  cd into folder VisualizationMultiPaxos
    3)  bower install  # to install all bower components based on bower.json
    4)  npm install # to install all node modules based on package.json
    5)  gulp serve # to start the server
    
    This method had been tested on Microsoft Windows 8.1

UI: demo_UI.PNG

    Input Form: number of Paxos servers to run
    Initialize Paxos: running the multi-paxos in child process
    Reload Recent data: loading the last message log of multi-paxos 
    
    Control Bar: 
          TimeLine: a adjustable time line to control all animations based on time
          Buttons: play, pause, resume, reverse and restart (control the time line)
          Scale Bar: to adjust the speed of animation
          
    
    
More:

    This app will start three servers: 5000,6000, and 9000
    Port 9000: To serve the front end ( A visualizer)
    Port 6000: A Master Server to centralize all the messages that are sent and received by Paxos Servers
    Port 5000: A bridge between front end and the node backend



