__author__ = 'zj'
import socket
import json


def sendToServer(message_type,from_port,to_port,message_content):
                        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        s.connect(("localhost",6000))
                        messages=[]
                        for m in message_content:
                                    messages.append(m)
                        dict={'type':message_type,'from':from_port,'to':to_port,'message':messages}
                        bs=json.dumps(dict)
                        s.send(bs.encode())
                        s.close()