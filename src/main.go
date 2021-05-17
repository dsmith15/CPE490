package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool) //tracks connected clients
var broadcast = make(chan Message)	//broadcast channel: queue for messages

var upgrader = websocket.Upgrader{} //upgrades normal HTTP connection to WebSocket

//message object
type Message struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Message  string `json:"message"`
}

func main() {
	fs := http.FileServer(http.Dir("../public")) //simple file server
	http.Handle("/", fs)
	http.HandleFunc("/ws", handleConnections) //defining route for handing websocket requests
	
	go handleMessages() //listeneing for incoming chat messages
	//starting server on localhost port 8000; logs any errors
	log.Println("http server started on :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request){
//upgrades initial GET request to a ws
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
//close connection when the function exits
	defer ws.Close()
//register new clients
	clients[ws]=true
//infinite loop that waits for messages to be written from ws
	for {
		var msg Message

		err := ws.ReadJSON(&msg) //reads in a message as JSON and map it to message object
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		broadcast <- msg
	}
}

func handleMessages(){
	for {
		msg := <-broadcast //grabs next message from broadcast channel

		//sends message to all connected clients
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}