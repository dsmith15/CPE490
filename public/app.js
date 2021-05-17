new Vue({
  el: '#app',

  data: {
    ws: null, //websocket
    newMsg: '', //holds new messages to be sent to server
    chatContent: '', //list of chat messages
    email: null, //email address
    username: null,
    joined: false //true if email and username are filled

  },

 
//created attribute makes function run as soon as an instance is created
  created: function () {
    var self = this;
    this.ws = new WebSocket('ws://' + window.location.host + '/ws');
    this.ws.addEventListener('message', function (e) {
      var msg = JSON.parse(e.data);
      self.chatContent += '<div class="chip">'
        + '<img src="' + self.gravatarURL(msg.email) + '">' //gets avatar
        + msg.username
        + '</div>'
        + emojione.toImage(msg.message) + '<br/>';
      var element = document.getElementById('chat-messages');
      element.scrollTop = element.scrollHeight; //autoscrolling
    });
  },

  methods: {
    

    //method to send messages to server
    send: function () {
      if (this.newMsg != '') {
       //if (!checkOpen(this.ws)) return; was checking ws error not sending messages
        this.ws.send(
          JSON.stringify({
            email: this.email,
            username: this.username,
            message: $('<p>').html(this.newMsg).text() //strips out html 
          }
          ));
        this.newMsg = ''; //resets newMsg
      }
    },
    //checks that an email and username have been entered and sets joined to true
    join: function () {
      if (!this.email) {
        Materialize.toast('You must enter an email', 2000);
        return
      }
      if (!this.username) {
        Materialize.toast('You must enter a username', 2000);
        return
      }
      this.email = $('<p>').html(this.email).text();
      this.username = $('<p>').html(this.username).text();
      this.joined = true;
    },

    //checkOpen: function (ws) { return ws.readyState === ws.Open },
    
    gravatarURL: function (email) {
      return 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email);
    }
  }
});